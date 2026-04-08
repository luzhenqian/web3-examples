# Web3 Examples

本仓库包含了一系列涵盖前端、智能合约和后端的 Web3 示例代码，旨在帮助开发者快速学习和应用到实际项目中。

## 目录

- [项目结构](#项目结构)
- [在线预览](#在线预览)
- [社区交流](#社区交流)
- [环境准备](#环境准备)
- [本地运行](#本地运行)
- [学习资源](#学习资源)
- [招聘平台](#招聘平台)
- [测试网水龙头](#测试网水龙头)
- [脚本](#脚本)

## 项目结构

项目已按区块链类型组织，目录结构如下：

```
web3-examples/
├── ethereum/          # 以太坊相关项目
│   ├── contract/     # 智能合约（Noah Token, Noah NFT 等）
│   ├── frontend/     # Web 前端应用
│   └── mock/         # 测试数据
├── bitcoin/          # 比特币相关项目
│   └── bitcoinjs-lib/  # Bitcoin.js 示例
├── solana/           # Solana 相关项目
│   └── solana-pyth-price-feeds/  # Solana Pyth 价格预言机 DApp
├── ton/              # TON 相关项目
│   └── wallet/       # TON 钱包
├── blockchain/       # 通用区块链概念教学代码
├── script/           # 实用脚本
├── docs/             # 文档
└── assets/           # 资源文件
```

## 在线预览

预览地址：[https://examples.web3doc.xyz](https://examples.web3doc.xyz/)

## 社区交流

如果你对 Web3 感兴趣，想从事 Web3 开发或探讨相关话题，请加入 Noah 的人人都会 Web3 社区：https://t.me/everyonesweb3

或者添加 Noah 的微信：`LZQ20130415`。

## 环境准备

由于部分服务可能需要翻墙访问，或依赖于需要翻墙的服务（如 Google 验证码），建议确保你的网络环境可以科学上网。

以下是几个可靠的科学上网工具推荐：

- <https://www.taozijichang.xyz/#/register?code=nBCHS0pq>：性价比最高，很稳定，非常推荐。可以配合 SSR、Clash、Shadowrocket、V2Ray 等客户端使用。5 元优惠码：`HlX3Ygdu`；10 元优惠码：`yIqSm0jL`。
- <https://share.jsq888.com/raf?u=89716999>：性价比高，速度可以，比较稳定。一个账号支持 5 个设备。使用邀请码 89716999 可以获得优惠。
- <https://bitbucket.org/letsgo666/letsgo_en_1/src/main/README.md>：价格较高，一个账号支持 2 个设备。体验较好。使用邀请码 61922063 可以获得免费试用时长。

请注意，以上工具仅供学习使用。若利用这些工具从事违法犯罪行为，我们概不承担任何法律责任。

## 本地运行

### 以太坊项目

#### 前端

前端代码位于 `ethereum/frontend` 目录下。在运行之前，请确保完成以下准备工作：

1. 将 `.env.example` 文件重命名为 `.env`，并补充完整配置信息。
2. 至少在 [Alchemy](https://www.alchemy.com/) 上申请一个 API Key。

接下来，安装依赖并启动项目：

```bash
cd ethereum/frontend
npm i
npm run dev
```

#### 智能合约

智能合约代码位于 `ethereum/contract` 目录下。在运行之前，请确保完成以下准备工作：

1. 将 `.env.example` 文件重命名为 `.env`，并补充完整配置信息。
2. 至少在 [Infura](https://www.infura.io/) 上申请一个 Project Key。

然后，你可以使用 `truffle` 进行智能合约开发。

### Solana 项目

Solana 项目代码位于 `solana/solana-pyth-price-feeds` 目录下。详见 [项目 README](./solana/solana-pyth-price-feeds/app/README.md)。

### Bitcoin 项目

Bitcoin 项目代码位于 `bitcoin/bitcoinjs-lib` 目录下。

### TON 项目

TON 项目代码位于 `ton/wallet` 目录下。

## 学习资源

如果你有新的资源推荐或发现列表中的资源已过时或质量不佳，请通过 issue 通知我们更新。

### DApp & Solidity 智能合约

- [CryptoZombies](https://cryptozombies.io/) - 通过游戏形式学习 Solidity，非常适合初学者。
- [CryptoZombies 中文课程](https://cryptozombies.io/zh/course/) - 加密僵尸游戏的中文课程。
- [Ethernaut by OpenZeppelin](https://ethernaut.openzeppelin.com/) - OpenZeppelin 推出的动手学习 Solidity 的平台。
- [Chainshot](https://www.chainshot.com/) - 通过动手实践学习智能合约开发。
- [FreeCodeCamp Solidity Tutorial](https://www.youtube.com/watch?v=M576WGiDBdQ) - FreeCodeCamp 的 Solidity 教程视频。
- [Ethereum 官方教程](https://ethereum.org/en/developers/tutorials/) - 以太坊官方提供的开发教程。
- [Ethereum 文档](https://ethereum.org/en/developers/docs/) - 以太坊官方开发文档。
- [Ethereum DApps 展示](https://ethereum.org/en/dapps/) - 以太坊官方的 DApp 展示页面。
- [WTF Academy](https://wtf.academy/) - 从 Solidity 基础到进阶的课程。
- [LearnWeb3.io](https://learnweb3.io/) - Web3 学习网站。
- [Pointer](https://www.pointer.gg/) - 同样是 Web3 学习网站。

### 综合学习资源

- [Continuum](https://continuum.xyz/) - 通过学习 Web3 基础获得 NFT 奖励的学习平台。
- [Dapp University](https://www.dappuniversity.com/) - 专注于 DApp 开发的系列教学视频。
- [Web3 University](https://www.web3.university/find) - 内容全面的 Web3 在线学习平台。
- [Hashnode Web3 Channel](https://web3.hashnode.com/) - Hashnode 的 Web3 专栏。
- [Mirror Developer Platform](https://dev.mirror.xyz/) - Mirror 上集合了众多优秀的 Web3 开发者的文章。
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/) - 官方的 Ethereum Q&A 社区。
- [EthResearch](https://ethresear.ch/) - Ethereum 技术论坛。
- [OpenSea Blog](https://opensea.io/blog) - OpenSea 的官方博客。
- [Reddit Web3](https://www.reddit.com/r/web3/) - Reddit 上的 Web3 频道。
- [Medium Web3 Topics](https://medium.com/tag/web3) - Medium 上关于 Web3 的讨论。

### 区块链基础

- [Coursera Blockchain Basics](https://www.coursera.org/learn/blockchain-basics) - Coursera 上的区块链基础课程。
- [Conflux 中文区块链论坛](https://forum.conflux.fun/c/Chinese) - Conflux 论坛的中文区。
- [Microsoft Blockchain Development Introduction](https://learn.microsoft.com/zh-cn/training/paths/ethereum-blockchain-development/) - 微软提供的区块链开发入门课程。
- [MIT Blockchain Course](https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/video_galleries/video-lectures/) - MIT 提供的关于区块链的课程。

### 白皮书

- [比特币白皮书](https://bitcoin.org/bitcoin.pdf)
- [以太坊白皮书](https://ethereum.org/en/whitepaper/)
- [Uniswap V2 白皮书](https://uniswap.org/whitepaper.pdf)
- [Uniswap V3 白皮书](https://uniswap.org/whitepaper-v3.pdf)

### 官方文档

- [Solidity](https://docs.soliditylang.org/en/) - 智能合约编程语言。
- [OpenZeppelin](https://www.openzeppelin.com/) - Solidity 安全开发工具库。
- [Remix IDE](https://remix.run/docs/en/v1) - Solidity 开发的在线 IDE。
- [Hardhat](https://hardhat.org/) - 用于智能合约开发的环境框架。
- [Truffle Suite](https://trufflesuite.com/) - 包含 Truffle、Ganache 和 Drizzle 的智能合约开发环境。
- [Ethers.js](https://docs.ethers.org/) - 用于与智能合约交互的库。
- [Web3.js](https://web3js.readthedocs.io/en/) - 另一种用于智能合约交互的库。
- [Viem](https://viem.sh/) - 最新的智能合约交互库。
- [Wagmi](https://wagmi.sh/) - 提供 React Hooks 风格 API 的智能合约交互库。
- [RainbowKit](https://www.rainbowkit.com/zh-CN/docs/introduction) - 用于构建 Web3 钱包连接界面的库，支持 React。

### 书籍

- [精通比特币](https://github.com/tianmingyun/MasterBitcoin2CN) - 对比特币深入讲解的书籍。
- [精通以太坊](https://github.com/inoutcode/ethereum_book) - 以太坊技术深入分析的书籍。
- [How to DeFi](https://nigdaemon.gitbook.io/how-to-defi-advanced-zhogn-wen-b) - DeFi 技术深入分析的书籍。

### 铭文协议

- [Ordinals 协议](https://docs.ordinals.com/) - BRC20 背后的铭文协议。
- [Atomicals 协议](https://docs.atomicals.xyz) - ARC20 背后的铭文协议。

## 招聘平台

### 中文区

- [ABetterWeb3](https://abetterweb3.notion.site/abetterweb3/daa095830b624e96af46de63fb9771b9)
- [Foresight News](https://foresightnews.pro/job)
- [电鸭社区](https://eleduck.com/search?keyword=web3)
- [TinTin Job Board](https://attractive-spade-1e3.notion.site/37f6da2316a845fba6ff6f62f3c50289?v=e88aaffca0ee462db5e9daa53946059f)
- [Rebase Who is Hiring](https://github.com/rebase-network/who-is-hiring/issues)
- [BOSS 直聘](https://www.zhipin.com/shanghai/)
- [Block Job](https://twitter.com/blockjob2022)

### 英文区

- [Upwork](https://www.upwork.com/)
- [Remote3](https://remote3.co/)
- [Web3 Career](https://web3.career/)
- [CryptocurrencyJobs](https://cryptocurrencyjobs.co/)
- [Wellfound](https://wellfound.com/)
- [Crypto Recruit](https://www.cryptorecruit.com/)
- [Works Hub](https://blockchain.works-hub.com/)
- [Crypto Job List](https://cryptojobslist.com/)
- [Dejob](https://www.dejob.top/)
- [Crypto Jobs](https://crypto.jobs/)
- [Stablegram](https://stablegram.com/)
- [Froog](https://froog.co/)
- [RemoteOK](https://remoteok.com/)

## 测试网水龙头

- <https://sepolia-faucet.pk910.de/> - 挖矿
- <https://www.alchemy.com/faucets/ethereum-sepolia> - Alchemy Ethereum 水龙头
- <https://www.infura.io/faucet/sepolia> - Infura Ethereum 水龙头
- <https://faucet.quicknode.com/ethereum/sepolia/> - QuickNode Ethereum 水龙头
- <https://faucet.polygon.technology/> - Polygon
- <https://www.bsquared.network/faucet/> - B2 Network
- <https://www.bnbchain.org/en/testnet-faucet> - Binance Smart Chain

## 撸毛工具

现在我们成立了 bc1 社区，请访问 [bc1.wiki](https://bc1.wiki/bc1) 了解并加入我们。

### 指纹浏览器与 IP 代理

- [MoreLogin](https://www.morelogin.com/?from=AA3jnj3sJxy4)
- [ClonBrowser](https://www.clonbrowser.net/?code=SSXf6Z) - 支持多开，自带窗口同步器，IP 绑定简单方便。

### 资讯媒体平台

- [Foresight News](https://foresightnews.pro/)
- [币安新闻](https://www.binance.com/zh-CN/square/news/all)
- [Gate 深度](https://www.gate.io/zh/post?type=depth)
- [陀螺科技](https://www.tuoluo.cn/kuaixun/)
- [MarsBit 7x24H 快讯](https://news.marsbit.co/flash)
- [Odaily 快讯](https://www.odaily.news/newsflash)
- [律动快讯](https://www.theblockbeats.info/newsflash)
- [PANews 快讯&深度](https://www.panewslab.com/zh/news/index.html)
- [Chain Catcher 快讯](https://www.chaincatcher.com/news)
- [TechFlow 7x24H 快讯](https://www.techflowpost.com/newsletter/index.html)

### 空投信息网站

- <https://airdrops.io/>
- <https://dropsearn.com/airdrops/>
- <https://www.cosmosairdrops.io/claimable>
- <https://www.alphadrops.net/alpha>
- <https://galxe.com/>

### 项目调研

- <https://coinmarketcap.com/> - 最大的行情网站。
- <https://www.coingecko.com/> - 大型行情网站。
- <https://www.rootdata.com/> - 查询项目的投资情况。
- <https://geniidata.com/> - 分析市场趋势，特别是 Ordinals 和 BRC20 生态。
- <https://www.coincarp.com/zh/> - 大型行情网站。
- <https://defillama.com/> - 查询 DeFi 协议的链上数据。
- <https://dune.com/home> - 链上数据分析和数据可视化。
- <https://app.whales.market/?r=256788> - 鲸鱼市场，查询和交易未上市代币、积分的场外交易价格。
- <https://gopluslabs.io/token-security> - GoPlus，查询代币的安全性，有效避免貔貅盘。
- <https://www.oklink.com/zh-hans/approval> - OKX 钱包授权检测。

## 脚本

- [particle-network](./script/particle-network)

## 交易所注册手续费减免

| 交易所 | 邀请码 | 返佣 | 注册链接 |
|--------|--------|------|----------|
| 币安 Binance | `DYE5M7LZ` | 最高 20% | [注册](https://www.binance.info/zh-CN/join?ref=DYE5M7LZ) |
| 芝麻 Gate | `AlBNUAhe` / `BITCNOAH` | 最高 20% | [注册](https://www.gate.io/signup/AlBNUAhe?ref_type=103) |
| 欧易 OKX | `NOAH666` | 最高 20% | [注册](https://www.yyjiagou.com/join/noah666) |
| Bitget | `bc1666` | 最高 20% | [注册](https://partner.bitget.fit/bg/bc1666) |
| 火币 HTX | `s2r99223` | 最高 30% | [注册](https://www.htx.co.zw/invite/zh-cn/1h?invite_code=s2r99223) |
| 深币 DeepCoin | `S510498` | 最高 30% | [注册](https://s.deepcoin.com/sfbaeji) |
| XT | `NOAH` | 最高 80% | [注册](https://www.xt.com/zh-CN/accounts/register?ref=NOAH) |

## U 卡

如果你想使用加密货币进行消费，推荐使用 PokePay，注册就送 12.8 USDT 开卡抵扣券：

<https://app.pokepay.cc/pages/passport/invitation?r=162465>
