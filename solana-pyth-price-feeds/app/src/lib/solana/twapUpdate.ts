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
 * 使用时间加权平均价格（TWAP）发送 SOL 的函数
 *
 * @param connection - Solana 区块链连接对象
 * @param wallet - 用户的 Anchor 钱包
 * @param destination - 收款人的公钥地址
 * @param amount - 要发送的美元金额
 * @param twapWindowSeconds - TWAP 时间窗口（秒）
 */
export async function postTwapPriceUpdate(
  connection: Connection,
  wallet: AnchorWallet | undefined,
  destination: PublicKey | undefined,
  amount: number | undefined,
  twapWindowSeconds: number
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
  const twapWindowInteger = Math.floor(twapWindowSeconds);

  console.log("发送 TWAP 交易参数:", {
    wallet: wallet.publicKey.toString(),
    destination: destination.toString(),
    amount: amountInteger,
    twapWindowSeconds: twapWindowInteger
  });

  // 初始化 Hermes 客户端
  const hermesClient = new HermesClient(HERMES_URL);

  // 初始化 Pyth Solana 接收器
  const pythSolanaReceiver = new PythSolanaReceiver({
    connection,
    wallet: wallet as Wallet,
  });

  // 从 Hermes API 获取 TWAP 数据
  const twapUpdateData = await hermesClient.getLatestTwaps(
    [SOL_PRICE_FEED_ID],
    twapWindowInteger,
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

  // 添加 TWAP 更新指令到交易中
  await transactionBuilder.addPostTwapUpdates(twapUpdateData.binary.data);

  // 添加 TWAP 消费者指令
  await transactionBuilder.addTwapConsumerInstructions(
    async (
      getTwapUpdateAccount: (priceFeedId: string) => PublicKey
    ): Promise<InstructionWithEphemeralSigners[]> => {
      // 确保传递给 BN 的是整数值
      const amountBN = new BN(amountInteger);
      const twapWindowBN = new BN(twapWindowInteger);

      return [
        {
          instruction: await sendUsdApp.methods
            .sendUsingTwap(amountBN, twapWindowBN)
            .accounts({
              payer: wallet.publicKey,  // 付款人（签名者）
              destination,  // 收款人地址
              twapUpdate: getTwapUpdateAccount(SOL_PRICE_FEED_ID),  // TWAP 数据账户
              systemProgram: SystemProgram.programId,  // Solana 系统程序
            })
            .instruction(),
          signers: [],
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
