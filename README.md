# Web3 Examples

这是一个包含前端、智能合约、后端的 Web3 示例仓库。

包含了各种常用的场景代码。

可以用来学习，也可以直接用于实际项目。

## 线上预览地址

[https://web3-examples.vercel.app/](https://web3-examples.vercel.app/)

## 本地运行

### 前端

前端代码在 frontend 目录中，可以在这个目录中运行代码。

不过在运行项目之前需要提前做一些必要的准备。

你需要将 .env.example 文件重命名为 .env，并将其中的配置补充完整。

你至少需要在 [alchemy](https://www.alchemy.com/) 申请一个 API Key。

然后安装依赖，启动项目。

```bash
npm i
npm run dev
```

### 智能合约

智能合约代码在 contract 目录中。

不过在运行项目之前需要提前做一些必要的准备。

你需要将 .env.example 文件重命名为 .env，并将其中的配置补充完整。

你至少需要在 [infura](https://www.infura.io/) 申请一个 Project Key。

然后就可以使用 truffle 进行开发了。
