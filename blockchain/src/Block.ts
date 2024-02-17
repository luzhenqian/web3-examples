import sha256 from "crypto-js/sha256";

export class Block {
  index: number; // 区块索引
  timestamp: string; // 时间戳
  data: string; // 区块数据
  previousHash: string; // 前一个区块的哈希值
  hash: string; // 当前区块的哈希值
  nonce: number; // 随机数

  constructor(
    index: number,
    timestamp: string,
    data: string,
    previousHash: string = ""
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  // 计算区块哈希值
  calculateHash(): string {
    return sha256(
      this.index + this.previousHash + this.timestamp + this.data + this.nonce
    ).toString();
  }

  // 挖掘新区块
  mineBlock(difficulty: number): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }
}
