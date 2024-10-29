import {
  internal,
  TonClient,
  WalletContractV4,
  external,
  beginCell,
  storeMessage,
  Address,
} from "@ton/ton";

// wallet: 钱包合约实例
// secretKey: 钱包私钥
// dest: 目标地址
// value: 转账金额，单位为 nanograms，1TON = 10^9 nanograms
export async function transfer(
  wallet: WalletContractV4,
  secretKey: string,
  dest: string,
  value: bigint
) {
  console.debug(secretKey, dest, value);
  // 创建 TonClient 实例
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: "xxx",
  });
  // 打开钱包合约
  const contract = client.open(wallet);
  // 获取当前序列号
  const seqno: number = await contract.getSeqno();
  // 创建转账交易
  let transfer = await contract.createTransfer({
    seqno,
    messages: [
      internal({
        value,
        to: Address.parse(dest).toRawString(),
        bounce: false,
        init: wallet.init,
      }),
    ],
    secretKey: Buffer.from(secretKey, "hex"),
  });
  try {
    // 因为接口有限制，免费版 1 秒钟只能调用 1 次，所以这里等待 2 秒
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // 交易上链
    await contract.send(transfer);
    // 获取交易 hash
    const hash = await getHash(transfer, wallet.address);
    // transfer.hash() 存在问题，得到的 hash 不正确
    return {
      hash,
      seqno,
    };
  } catch (e) {
    console.debug(e.message, e);
  }
}

// 获取交易 hash
async function getHash(transfer, address) {
  // 创建外部消息
  const ext = external({
    to: address,
    body: transfer,
  });
  // 转换为 boc 格式
  const boc = beginCell().store(storeMessage(ext)).endCell();
  // 返回 hash
  return boc.hash().toString("hex");
}
