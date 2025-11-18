import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';

// 设置比特币网络
const network = bitcoin.networks.bitcoin;
// 生成随机的助记词
const mnemonic = bip39.generateMnemonic();
// 通过助记词生成种子
const seed = bip39.mnemonicToSeedSync(mnemonic);
// 通过种子生成根密钥
const root = bip32.BIP32Factory(ecc).fromSeed(seed, network);

// m/44'/0'/0'/0/0 是 P2WPKH 的 BIP32 派生路径
const path = "m/44'/0'/0'/0/0";
// 根据派生路径生成子密钥
const child = root.derivePath(path);
// 根据子密钥生成密钥对实例
const keyPairInstance = ECPairFactory(ecc).fromPrivateKey(child.privateKey!, { network });
// 通过密钥对实例创建一个新的P2WPKH地址
const { address, pubkey } = bitcoin.payments.p2wpkh({ pubkey: keyPairInstance.publicKey, network });
// 获取 WIF 格式的私钥
const privateKey = keyPairInstance.toWIF();

console.debug('Address:', address);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', privateKey);
console.debug('Mnemonic:', mnemonic);
