# SendUSD - Solana Pyth Price Feeds DApp

基于 Pyth 价格预言机的 Solana 转账应用，使用 Next.js、TypeScript 和 Tailwind CSS 构建。

## 功能特性

- 🔄 实时 SOL/USD 价格显示（通过 Pyth Network）
- 💰 根据美元金额自动计算并发送等值 SOL
- 📊 支持即时价格和 TWAP（时间加权平均价格）两种模式
- 🎨 现代化、响应式 UI 设计
- 🔐 Solana 钱包集成（支持多种钱包）
- ⚡ 优化的用户体验和交互反馈

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **区块链**:
  - Solana Web3.js
  - Anchor Framework
  - Pyth Network (价格预言机)
- **钱包**: Solana Wallet Adapter

## 项目结构

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页面
│   ├── components/            # React 组件
│   │   ├── ui/               # UI 基础组件
│   │   ├── providers/        # Context Providers
│   │   ├── price/           # 价格相关组件
│   │   └── send/            # 发送功能组件
│   ├── lib/                 # 工具函数和配置
│   │   ├── solana/          # Solana 相关逻辑
│   │   └── utils.ts
│   ├── idl/                # Anchor IDL 文件
│   └── types/              # TypeScript 类型定义
├── public/                 # 静态资源
└── ...配置文件
```

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 构建生产版本

```bash
npm run build
npm run start
```

## 使用说明

1. **连接钱包**: 点击"Select Wallet"按钮连接 Solana 钱包（Devnet）
2. **查看实时价格**: 页面自动显示 SOL/USD 实时价格，每 10 秒更新
3. **输入收款地址**: 输入收款人的 Solana 公钥地址
4. **输入金额**: 输入美元金额，系统自动计算 SOL 数量
5. **选择价格模式**:
   - **即时价格**: 使用当前最新市场价格
   - **TWAP 价格**: 使用时间加权平均价格（1-10 分钟）
6. **发送交易**: 点击相应按钮发送交易

## 主要改进

### 📁 项目结构
- Next.js App Router，更清晰的文件组织
- 组件按功能分类
- 业务逻辑与 UI 分离

### 🎨 UI/UX
- Tailwind CSS 现代化设计
- 渐变背景和玻璃态效果
- 流畅动画和过渡
- 响应式设计
- 改进的表单验证

### 💻 代码质量
- 完整 TypeScript 类型支持
- 可复用 UI 组件
- 清晰注释和文档
- 更好的错误处理

## 注意事项

⚠️ **演示应用，仅在 Solana Devnet 运行**

## 相关链接

- [Next.js](https://nextjs.org/docs)
- [Solana](https://docs.solana.com/)
- [Pyth Network](https://pyth.network/)
- [Anchor](https://www.anchor-lang.com/)
