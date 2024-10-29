import { mnemonicToWalletKey, mnemonicNew } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

export async function createWallet() {
  // 生成 24 位助记词
  const mnemonic = await mnemonicNew(24);
  // 生成助记词对应的私钥
  const key = await mnemonicToWalletKey(mnemonic);
  // 通过私钥获取公钥
  const publicKey = key.publicKey;
  // 获取钱包合约
  const walletContract = WalletContractV4.create({
    // workchain: 0,
    // 测试网
    workchain: -1,
    publicKey,
  });
  // 获取钱包私钥
  const secretKey = key.secretKey.toString("hex");
  // 获取钱包地址
  const address = walletContract.address.toString();
  // 原始钱包地址
  const rawAddress = walletContract.address.toRawString();
  return {
    mnemonic,
    secretKey,
    publicKey: publicKey.toString("hex"),
    address,
    rawAddress,
  };
}
