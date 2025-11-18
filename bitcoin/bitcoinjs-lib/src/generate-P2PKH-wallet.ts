import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// 设置比特币网络
const network = bitcoin.networks.bitcoin;
// 创建一个新的密钥对工厂
const keyPair = ECPairFactory(ecc);
// 通过密钥对工厂创建一个新的密钥对实例
const keyPairInstance = keyPair.makeRandom({ network });
// 通过密钥对实例创建一个新的P2PKH地址
const { address, pubkey } = bitcoin.payments.p2pkh({ pubkey: keyPairInstance.publicKey, network });
// 获取 WIF 格式的私钥（WIF 是 Wallet Import Format 的缩写，即钱包导入格式）
const privateKey = keyPairInstance.toWIF();

console.debug('Address:', address);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', privateKey);
