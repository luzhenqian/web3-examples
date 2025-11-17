import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import BN from "bn.js"; // Next.js 需要从 bn.js 直接导入 BN
import {
  PythSolanaReceiver,
  InstructionWithEphemeralSigners,
} from "@pythnetwork/pyth-solana-receiver";
import { HermesClient } from "@pythnetwork/hermes-client";
import { SendUSDApp, IDL } from "../../idl/send_usd_app";
import {
  SOL_PRICE_FEED_ID,
  HERMES_URL,
} from "./config";

// SendUSD 程序的地址（从 IDL 中获取）
const SEND_USD_PROGRAM_ID_STRING = "2e5gZD3suxgJgkCg4pkoogxDKszy1SAwokz8mNeZUj4M";

/**
 * 使用即时价格发送 SOL 的函数
 *
 * @param connection - Solana 区块链连接对象
 * @param wallet - 用户的 Anchor 钱包
 * @param destination - 收款人的公钥地址
 * @param amount - 要发送的美元金额
 */
export async function postPriceUpdate(
  connection: Connection,
  wallet: AnchorWallet | undefined,
  destination: PublicKey | undefined,
  amount: number | undefined
): Promise<void> {
  // 参数验证
  if (!wallet) {
    throw new Error("请先连接钱包");
  }
  if (!destination) {
    throw new Error("请提供收款地址");
  }
  if (!amount || amount <= 0) {
    throw new Error("请提供有效的金额");
  }

  // 将金额转换为整数（程序期望整数美元金额）
  // 例如: 11.5 -> 11, 100.99 -> 100
  const amountInteger = Math.floor(amount);

  console.log("发送交易参数:", {
    wallet: wallet.publicKey.toString(),
    destination: destination.toString(),
    amount: amountInteger
  });

  // 初始化 Hermes 客户端
  const hermesClient = new HermesClient(HERMES_URL);

  // 初始化 Pyth Solana 接收器
  const pythSolanaReceiver = new PythSolanaReceiver({
    connection,
    wallet: wallet as Wallet,
  });

  // 从 Hermes API 获取 SOL/USD 的最新价格更新数据
  const priceUpdateData = await hermesClient.getLatestPriceUpdates(
    [SOL_PRICE_FEED_ID],
    { encoding: "base64" }
  );

  // 初始化 SendUSD 程序实例
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  const programId = new PublicKey(SEND_USD_PROGRAM_ID_STRING);
  const sendUsdApp = new Program<SendUSDApp>(
    IDL as any, // 使用 any 绕过类型检查
    programId,
    provider
  );

  // 创建交易构建器
  const transactionBuilder = pythSolanaReceiver.newTransactionBuilder({
    closeUpdateAccounts: true,
  });

  // 添加价格更新指令到交易中
  await transactionBuilder.addPostPriceUpdates(priceUpdateData.binary.data);

  // 添加价格消费者指令
  await transactionBuilder.addPriceConsumerInstructions(
    async (
      getPriceUpdateAccount: (priceFeedId: string) => PublicKey
    ): Promise<InstructionWithEphemeralSigners[]> => {
      // 确保传递给 BN 的是整数值
      const amountBN = new BN(amountInteger);

      return [
        {
          // 调用 SendUSD 程序的 send 方法
          instruction: await sendUsdApp.methods
            .send(amountBN)  // 传入美元金额
            .accounts({
              payer: wallet.publicKey,  // 付款人（签名者）
              destination,  // 收款人地址
              priceUpdate: getPriceUpdateAccount(SOL_PRICE_FEED_ID),  // 价格数据账户
              systemProgram: SystemProgram.programId,  // Solana 系统程序
            })
            .instruction(),
          signers: [],  // 无需额外签名者（钱包已自动签名）
        },
      ];
    }
  );

  // 构建并发送交易
  await pythSolanaReceiver.provider.sendAll(
    await transactionBuilder.buildVersionedTransactions({
      computeUnitPriceMicroLamports: 50000,
    }),
    { skipPreflight: true }
  );
}
