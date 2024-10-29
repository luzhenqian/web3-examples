import { mnemonicToWalletKey, keyPairFromSecretKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";

// 通过助记词导入钱包
export async function importFromMnemonic(mnemonic: string[]) {
  // 生成助记词对应的 key
  const key = await mnemonicToWalletKey(mnemonic);
  // 通过 key 获取钱包合约
  const walletContract = WalletContractV4.create({
    workchain: 0,
    publicKey: key.publicKey,
  });
  return walletContract;
}

// 通过助记词获取私钥
export async function getPrivateKeyFromMnemonic(mnemonic: string[]) {
  // 生成助记词对应的 key
  const key = await mnemonicToWalletKey(mnemonic);
  return key.secretKey.toString("hex");
}

// 通过私钥导入钱包
export async function importFromPrivateKey(secretKey: string) {
  // 通过私钥获取公钥
  const publicKey = keyPairFromSecretKey(
    Buffer.from(secretKey, "hex")
  ).publicKey;
  // 获取钱包合约
  const wallet = WalletContractV4.create({
    workchain: 1,
    publicKey,
  });
  return wallet;
}
