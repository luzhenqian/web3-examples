# 目录

- [Web3 示例项目](#web3-示例项目)
  - [在线预览](#在线预览)
  - [社区交流](#社区交流)
  - [环境准备](#环境准备)
  - [本地运行](#本地运行)
    - [前端](#前端)
    - [智能合约](#智能合约)
  - [学习资源](#学习资源)
    - [DApp & Solidity 智能合约学习资源](#dapp--solidity-智能合约学习资源)
    - [其他综合学习资源](#其他综合学习资源)
    - [区块链相关学习资源](#区块链相关学习资源)
    - [白皮书](#白皮书)
    - [官方文档](#官方文档)
    - [书籍](#书籍)
    - [铭文协议](#铭文协议)

# Web3 示例项目

本仓库包含了一系列涵盖前端、智能合约和后端的 Web3 示例代码，旨在帮助开发者快速学习和应用到实际项目中。我们提供了多种常用场景的示例代码。

## 在线预览

预览地址：[https://examples.web3doc.xyz](https://examples.web3doc.xyz/)

## 社区交流

如果你对 Web3 感兴趣，想从事 Web3 开发或探讨相关话题，请添加 Web3 布道师 Noah 的微信：「LZQ20130415」，将邀请你加入高质量的 Web3 交流群。

## 环境准备

由于部分服务可能需要翻墙访问，或依赖于需要翻墙的服务（如 Google 验证码），建议确保你的网络环境可以科学上网。

以下是几个可靠的科学上网工具推荐：

- <https://clashvpn.net/>：每日签到可以免费使用，也可以付费，比较稳定。
- <https://letsvpn.world/>：价格较高，一个账号支持 2 个设备
- <https://ghelper.app/>：价格较低，一个账号支持十几个设备

请注意，以上工具仅供学习使用。若利用这些工具从事违法犯罪行为，我们概不承担任何法律责任。

## 本地运行

### 前端

前端代码位于 `frontend` 目录下。在运行之前，请确保完成以下准备工作：

1. 将 `.env.example` 文件重命名为 `.env`，并补充完整配置信息。
2. 至少在 [alchemy](https://www.alchemy.com/) 上申请一个 API Key。

接下来，安装依赖并启动项目：

```bash
npm i
npm run dev
```

### 智能合约

智能合约代码位于 `contract` 目录下。在运行之前，请确保完成以下准备工作：

1. 将 `.env.example` 文件重命名为 `.env`，并补充完整配置信息。
2. 至少在 [infura](https://www.infura.io/) 上申请一个 Project Key。

然后，你可以使用 `truffle` 进行智能合约开发。

## 学习资源

为了帮助你更好的学习，我们整理了一份学习资源列表。如果你有新的资源推荐或发现列表中的资源已过时或质量不佳，请通过 issue 通知我们更新。

### DApp & Solidity 智能合约学习资源

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

### 其他综合学习资源

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

### 区块链相关学习资源

- [Coursera Blockchain Basics](https://www.coursera.org/learn/blockchain-basics) - Coursera 上的区块链基础课程。
- [Conflux 中文区块链论坛](https://forum.conflux.fun/c/Chinese) - Conflux 论坛的中文区。
- [Microsoft Blockchain Development Introduction](https://learn.microsoft.com/zh-cn/training/paths/ethereum-blockchain-development/) - 微软提供的区块链开发入门课程。
- [MIT Blockchain Course](https://ocw.mit.edu/courses/15-s12-blockchain-and-money-fall-2018/video_galleries/video-lectures/) - MIT 提供的关于区块链的课程。

### 白皮书

以下是几个重要项目的白皮书链接：

- [比特币白皮书](https://bitcoin.org/bitcoin.pdf)
- [以太坊白皮书](https://ethereum.org/en/whitepaper/)
- [Uniswap V2 白皮书](https://uniswap.org/whitepaper.pdf)
- [Uniswap V3 白皮书](https://uniswap.org/whitepaper-v3.pdf)

### 官方文档

以下是一些常用工具和库的官方文档链接：

- [Solidity 官方文档](https://docs.soliditylang.org/en/) - 智能合约编程语言。
- [OpenZeppelin](https://www.openzeppelin.com/) - Solidity 安全开发工具库。
- [Remix IDE 官方文档](https://remix.run/docs/en/v1) - Solidity 开发的在线 IDE。
- [Hardhat](https://hardhat.org/) - 用于智能合约开发的环境框架。
- [Truffle Suite](https://trufflesuite.com/) - 包含 Truffle、Ganache 和 Drizzle 的智能合约开发环境。
- [Ethers.js 官方文档](https://docs.ethers.org/) - 用于与智能合约交互的库。
- [Web3.js 官方文档](https://web3js.readthedocs.io/en/) - 另一种用于智能合约交互的库。
- [Viem](https://viem.sh/) - 最新的智能合约交库。
- [Wagmi](https://wagmi.sh/) - 提供 React Hooks 风格 API 的智能合约交互库。
- [RainbowKit](https://www.rainbowkit.com/zh-CN/docs/introduction) - 用于构建 Web3 钱包连接界面的库，支持 React。

### 书籍

以下是一些推荐的区块链和 Web3 相关书籍：

- [精通比特币](https://github.com/tianmingyun/MasterBitcoin2CN) - 对比特币深入讲解的书籍。
- [精通以太坊](https://github.com/inoutcode/ethereum_book) - 以太坊技术深入分析的书籍。

### 铭文协议

- [Ordinals 协议](https://docs.ordinals.com/) - BRC20 背后的铭文协议。
- [Atomicals 协议](https://docs.atomicals.xyz) - ARC20 背后的铭文协议。
