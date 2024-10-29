import { TonClient, WalletContractV4 } from "@ton/ton";

export async function getBalance(wallet: WalletContractV4) {
  // 创建 TonClient 实例
  const client = new TonClient({
    // 设置 RPC 端点
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });
  // 打开钱包合约
  const contract = client.open(wallet);
  // 获取余额
  const balance = await contract.getBalance();
  return balance
}
