import BIP32Factory from 'bip32';
import { networks, payments } from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';

// 助记词
const mnemonic = 'YOUR_MNEMONIC_KEY_HERE';
// 通过助记词生成种子
const seed = bip39.mnemonicToSeedSync(mnemonic);
// 通过种子生成根密钥
const root = BIP32Factory(ecc).fromSeed(seed, networks.bitcoin);
// 派生路径
const path = "m/44'/0'/0'/0/0";
// 通过派生路径生成子密钥
const child = root.derivePath(path);
// 通过子密钥生成密钥对实例
const keyPairInstance = ECPairFactory(ecc).fromPrivateKey(child.privateKey!, { network: networks.bitcoin });
// 通过密钥对实例创建一个新的P2PKH地址
const { address, pubkey } = payments.p2pkh({ pubkey: keyPairInstance.publicKey, network: networks.bitcoin });
// P2WPKH 地址
const { address: p2wpkhAddress } = payments.p2wpkh({ pubkey: keyPairInstance.publicKey, network: networks.bitcoin });

console.debug('Address:', address);
console.debug('P2WPKH Address:', p2wpkhAddress);
console.debug('Public key:', pubkey!.toString('hex'));
console.debug('Private key:', keyPairInstance.toWIF());

// Address: bc1qh2se25hxfzh4x7ntejdx6k49xvat5kunq39rpx
// Public key: 02a85dbd2ebcbee72fc80d7812037f7ad6dd28aa2c1b51eb3f75ade2e47d208bcf
// Private key: L1FK2B3qTg9Dyb8RneU6TdnGbot79ovNwdA7y7pDWVq9oUBknBwK
// Mnemonic: toe hammer travel fly trip live front funny south raccoon public toilet