"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";

// 动态导入需要浏览器环境的组件，禁用 SSR
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const WalletDisconnectButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletDisconnectButton),
  { ssr: false }
);

const PriceDisplay = dynamic(
  () => import("@/components/price/PriceDisplay").then((mod) => ({ default: mod.PriceDisplay })),
  { ssr: false }
);

const SendForm = dynamic(
  () => import("@/components/send/SendForm").then((mod) => ({ default: mod.SendForm })),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-6 animate-fade-in">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-soft">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent">
              SendUSD
            </h1>

            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              基于 Pyth 价格预言机的 Solana 转账应用
            </p>
            <p className="text-sm text-white/60 max-w-xl mx-auto">
              输入美元金额，程序将根据 Pyth 提供的实时 SOL/USD
              价格自动计算并发送等值的 SOL。支持即时价格和 TWAP（时间加权平均价格）两种模式。
            </p>
          </div>

          {/* Wallet Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <WalletMultiButton />
            <WalletDisconnectButton />
          </div>
        </header>

        {/* Price Display */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <PriceDisplay />
        </div>

        {/* Send Form */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <SendForm />
        </div>

        {/* Info Card */}
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">使用说明</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>连接你的 Solana 钱包（Devnet）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>输入收款人的 Solana 地址</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>输入要发送的美元金额</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>选择使用即时价格或 TWAP 价格发送</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 mt-1">•</span>
                  <span>
                    程序会自动根据 Pyth 价格预言机计算等值的 SOL 并转账
                  </span>
                </li>
              </ul>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-white/60 flex items-center gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  这是一个演示应用，运行在 Solana Devnet 上
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-white/40 py-8">
          <p>Powered by Pyth Network & Solana</p>
        </footer>
      </div>
    </main>
  );
}
