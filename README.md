# Web3 Examples

这是一个包含前端、智能合约、后端的 Web3 示例仓库。

包含了各种常用的场景代码。

可以用来学习，也可以直接用于实际项目。

## 线上预览地址

[https://webnext.cloud](https://webnext.cloud)

## 社群

如果你对 Web3 感兴趣，想要从事 Web3 开发，或是想探讨 Web3 相关内容。可添加 Web3 布道师 Noah 微信：「LZQ20130415」，拉你进高质量 Web3 交流群。

## 前提准备

由于有些服务需要科学上网，或者服务不需要科学上网，但它用到了需要科学上网的其他服务（比如 Google 验证码）。所以最好保证自身的网络环境是可以科学上网的。

这里推荐几个非常靠谱的科学上网工具：

- <https://pandavpnpro.com/zh-cn/> 价格便宜，一个账号最多支持 6 个设备

- <https://letsvpn.world/?hl=zh> 价格略贵，一个账号仅支持 2 个设备

- <https://ghelper.app/> 价格便宜，一个账号支持十几个设备

以上工具仅用作学习途径，如果你利用这些工具从事违法犯罪行为，本人不承担任何法律责任。

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

## 学习资源

这是我重新整理的学习资源。

[awesome](/docs/awesome.md)

如果你有新的资源，或者发现资源过期或者质量不佳，可以提 issue。
