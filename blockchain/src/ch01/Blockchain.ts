import { Block } from "./Block";

export class Blockchain {
  chain: Block[]; // 区块链
  difficulty: number; // 工作量证明难度
  height: number; // 区块链高度

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.height = 1;
  }

  // 创建创世区块
  createGenesisBlock(): Block {
    return new Block(0, '2024-02-18', "Genesis block", "0");
  }

  // 获取最新区块
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  // 添加新区块
  addBlock(newBlock: Block): void {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    this.height++;
  }

  // 验证区块链是否有效
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}