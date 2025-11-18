import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';

function generateTestnetAddress() {
  // 设置比特币网络
  const network = bitcoin.networks.testnet;
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

  return {
    address,
    pubkey: pubkey!.toString('hex'),
    privateKey,
    mnemonic
  }
}

// 通过比特币地址查询余额
async function getBalance(address: string) {
  const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`;
  const res = await fetch(url)
  return await res.json();
}

// 查询 UTXO
async function getUTXO(address: string) {
  const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`;
  const res = await fetch(url)
  return await res.json();
}

// 查询交易详情
async function getTxDetail(txHash: string) {
  const url = `https://api.blockcypher.com/v1/btc/test3/txs/${txHash}`;
  const res = await fetch(url)
  return await res.json();
}

// 广播交易
async function broadcastTx(tx: string) {
  const res = await fetch(
    `https://api.blockcypher.com/v1/btc/test3/txs/push`,
    {
      method: 'POST',
      body: JSON.stringify({
        tx,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return await res.json();
}

// 转账
async function transfer(privateKey: string, toAddress: string, amount: number) {
  try {
    // 定义验证函数，用于校验签名是否有效
    const validator = (
      pubkey: Buffer,
      msghash: Buffer,
      signature: Buffer,
    ): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

    // 创建一个新的密钥对工厂
    const ECPair = ECPairFactory(ecc);
    // 设置发送方私钥
    const alice = ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
    // 发送方地址
    const aliacAddress = bitcoin.payments.p2wpkh({ pubkey: alice.publicKey, network: bitcoin.networks.testnet }).address;
    // 动态查询 UTXO
    const utxo = await getUTXO(aliacAddress!);
    // 如果没有 UTXO，则无法进行转账，返回错误信息
    if (utxo.txrefs === null) {
      return 'No UTXO';
    }
    // 选择最后一个 UTXO 作为输入
    const utxoTarget = utxo.txrefs[utxo.txrefs.length - 1];
    // UTXO 的交易哈希
    const utxoHash = utxoTarget.tx_hash;
    // 查询 UTXO 对应的交易详情
    const txDetail = await getTxDetail(utxoHash);
    // 获取输出脚本的十六进制表示
    const scriptPubKeyHex = txDetail.outputs[0].script;
    // 创建一个新的 Psbt 实例 (Partially Signed Bitcoin Transaction)
    // 一个部分签名的比特币交易，被创建出来但还没有被完全签名的交易
    const psbt = new bitcoin.Psbt({
      network: bitcoin.networks.testnet,
    });
    // 设置 gas
    const fee = 1000;
    // 添加输入
    psbt.addInput({
      // UTXO 的交易哈希
      hash: utxoHash,
      // UTXO 的输出索引
      index: utxoTarget.tx_output_n,
      witnessUtxo: {
        // UTXO 的输出脚本
        script: Buffer.from(scriptPubKeyHex, 'hex'),
        // UTXO 的金额
        value: utxoTarget.value,
      }
    });
    // 添加输出
    psbt.addOutput({
      // 接收方地址
      address: toAddress,
      // 金额
      value: amount,
    });
    // 计算找零
    const change = utxoTarget.value - amount - fee;
    // 添加找零
    psbt.addOutput({
      // 找零地址
      address: aliacAddress!,
      // 金额
      value: change,
    });
    // 签名输入
    psbt.signInput(0, alice);
    // 验证输入签名
    psbt.validateSignaturesOfInput(0, validator);
    // 终结所有输入，表示签名完成
    psbt.finalizeAllInputs();
    // 提取交易事务
    const tx = psbt.extractTransaction().toHex();
    // 广播交易到比特币网络，等待确认
    const res = await broadcastTx(tx);
    return res;
  }
  catch (e) {
    console.error('transfer error: ', e);
  }
}

// 转账
transfer(
  process.env.ALICE_PRIVATE_KEY!,
  process.env.BOB_ADDRESS!,
  10000
).then(console.debug);

// 查询余额
getBalance(
  process.env.ALICE_ADDRESS!
).then(console.debug);

// 查询 UTXO
getUTXO(
  process.env.ALICE_ADDRESS!
).then(console.debug);
