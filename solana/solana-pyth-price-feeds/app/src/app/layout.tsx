import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { BufferProvider } from "@/components/providers/BufferProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SendUSD - Solana Pyth Price Feeds",
  description: "基于 Pyth 价格预言机的 SOL 转账应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <BufferProvider />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
