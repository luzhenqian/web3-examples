import { networks, payments } from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// 通过 WIF 格式的私钥可以导入钱包，从而控制这个地址上的比特币。

// WIF 格式的私钥
const privateKey = 'YOUR_PRIVATE_KEY_HERE'
// 通过 WIF 格式的私钥导入钱包
const keyPair = ECPairFactory(ecc).fromWIF(privateKey);
// 公钥
const pubkey = keyPair.publicKey;
// 比特币地址
const { address } = payments.p2pkh({ pubkey, network: networks.bitcoin });
// P2WPKH 地址
const { address: p2wpkhAddress } = payments.p2wpkh({ pubkey, network: networks.bitcoin });

console.debug('Address:', address);
console.debug('P2WPKH Address:', p2wpkhAddress);
console.debug('Public key:', pubkey.toString('hex'));
console.debug('Private key:', privateKey);
