import * as bitcoin from 'bitcoinjs-lib';
import { sign, verify } from 'bitcoinjs-message';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// WIF 格式的私钥
const privateKey = 'YOUR_PRIVATE_KEY_HERE'
// 通过 WIF 格式的私钥导入钱包
const keyPair = ECPairFactory(ecc).fromWIF(privateKey);
// 签名消息
const message = 'Hello, World!';
const signature = sign(message, keyPair.privateKey!, keyPair.compressed);
console.debug('Signature:', signature.toString('base64'));
// 获取地址
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin });
// 验证签名
const verified = verify(message, address!, signature);
console.debug('Verified: ', verified);
