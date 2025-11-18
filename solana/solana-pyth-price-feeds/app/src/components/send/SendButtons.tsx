"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// 使用动态导入避免 Anchor 代码在服务端打包
// 这解决了 Next.js + Webpack 5 + @coral-xyz/anchor 的兼容性问题
const loadPriceUpdate = () => import("@/lib/solana/priceUpdate");
const loadTwapUpdate = () => import("@/lib/solana/twapUpdate");

interface SendButtonsProps {
  destination: PublicKey | undefined;
  amount: number | undefined;
}

export function SendButtons({ destination, amount }: SendButtonsProps) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [twapWindowSeconds, setTwapWindowSeconds] = useState<number>(300);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    ""
  );

  const handleSpotPriceSend = async () => {
    if (!wallet) {
      setMessageType("error");
      setMessage("请先连接钱包");
      return;
    }
    if (!destination) {
      setMessageType("error");
      setMessage("请输入有效的收款地址");
      return;
    }
    if (!amount || amount <= 0) {
      setMessageType("error");
      setMessage("请输入有效的金额（大于 0）");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("正在处理交易，请稍候...");
      setMessageType("");

      // 动态加载 Anchor 模块（仅在客户端）
      const { postPriceUpdate } = await loadPriceUpdate();
      await postPriceUpdate(connection, wallet, destination, amount);

      setMessageType("success");
      setMessage(`成功发送 $${amount} 等值的 SOL！`);
    } catch (error: any) {
      setMessageType("error");
      setMessage(`交易失败: ${error.message || "未知错误"}`);
      console.error("交易错误:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwapPriceSend = async () => {
    if (!wallet) {
      setMessageType("error");
      setMessage("请先连接钱包");
      return;
    }
    if (!destination) {
      setMessageType("error");
      setMessage("请输入有效的收款地址");
      return;
    }
    if (!amount || amount <= 0) {
      setMessageType("error");
      setMessage("请输入有效的金额（大于 0）");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("正在处理交易，请稍候...");
      setMessageType("");

      // 动态加载 Anchor 模块（仅在客户端）
      const { postTwapPriceUpdate } = await loadTwapUpdate();
      await postTwapPriceUpdate(
        connection,
        wallet,
        destination,
        amount,
        twapWindowSeconds
      );

      setMessageType("success");
      setMessage(`成功使用 TWAP 价格发送 $${amount} 等值的 SOL！`);
    } catch (error: any) {
      setMessageType("error");
      setMessage(`交易失败: ${error.message || "未知错误"}`);
      console.error("交易错误:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <Alert variant={messageType === "success" ? "success" : messageType === "error" ? "error" : "info"}>
          <p className="text-sm">{message}</p>
        </Alert>
      )}

      {/* 按钮区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 即时价格按钮 */}
        <Button
          onClick={handleSpotPriceSend}
          loading={isLoading}
          disabled={isLoading}
          variant="primary"
          size="lg"
        >
          使用即时价格发送
        </Button>

        {/* TWAP 价格区域 */}
        <div className="space-y-3">
          <Button
            onClick={handleTwapPriceSend}
            loading={isLoading}
            disabled={isLoading}
            variant="success"
            size="lg"
            className="w-full"
          >
            使用 TWAP 价格发送
          </Button>

          {/* TWAP 时间窗口滑块 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">TWAP 时间窗口:</span>
              <span className="text-white font-semibold">
                {twapWindowSeconds}s ({Math.floor(twapWindowSeconds / 60)}分钟)
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="599"
              value={twapWindowSeconds}
              onChange={(e) => setTwapWindowSeconds(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-success-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-success-500
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>1分钟</span>
              <span>10分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
