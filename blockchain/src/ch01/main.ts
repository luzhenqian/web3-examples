import { Block } from "./Block";
import { Blockchain } from "./Blockchain";

const myBlockchain = new Blockchain();
console.debug("Mining block 1...");
myBlockchain.addBlock(
  new Block(
    1,
    "2024-02-18",
    JSON.stringify({
      amount: 4,
    })
  )
);

console.debug("Mining block 2...");
myBlockchain.addBlock(
  new Block(
    2,
    "2024-02-18",
    JSON.stringify({
      amount: 10,
    })
  )
);

console.debug("Blockchain is valid: ", myBlockchain.isChainValid());

myBlockchain.chain[1].data = JSON.stringify({
  amount: 100,
});

console.debug("Blockchain is valid: ", myBlockchain.isChainValid());