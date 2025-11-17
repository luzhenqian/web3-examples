"use client";

import { useState, useEffect } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { SOL_PRICE_FEED_ID, HERMES_URL, PRICE_UPDATE_INTERVAL } from "@/lib/solana/config";

type PriceChange = "up" | "down" | "stable";

export function PriceDisplay() {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<PriceChange>("stable");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchPrice = async () => {
    try {
      setError("");
      const hermesClient = new HermesClient(HERMES_URL);
      const priceData = await hermesClient.getLatestPriceUpdates(
        [SOL_PRICE_FEED_ID],
        { encoding: "base64" }
      );

      if (priceData.parsed && priceData.parsed.length > 0) {
        const parsedPrice = priceData.parsed[0].price;
        const actualPrice = Number(parsedPrice.price) * Math.pow(10, parsedPrice.expo);
        const confInterval = Number(parsedPrice.conf) * Math.pow(10, parsedPrice.expo);

        if (price !== null) {
          setPreviousPrice(price);
          if (actualPrice > price) {
            setPriceChange("up");
          } else if (actualPrice < price) {
            setPriceChange("down");
          } else {
            setPriceChange("stable");
          }
        }

        setPrice(actualPrice);
        setConfidence(confInterval);
        setLastUpdateTime(new Date().toLocaleTimeString("zh-CN"));
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(`获取价格失败: ${err.message}`);
      setIsLoading(false);
      console.error("价格获取错误:", err);
    }
  };

  useEffect(() => {
    fetchPrice();
    const intervalId = setInterval(fetchPrice, PRICE_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const getPriceChangeColor = () => {
    if (priceChange === "up") return "text-success-400";
    if (priceChange === "down") return "text-error-400";
    return "text-gray-400";
  };

  const getPriceChangeArrow = () => {
    if (priceChange === "up") return "↗";
    if (priceChange === "down") return "↘";
    return "→";
  };

  if (isLoading) {
    return (
      <Card className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/80">正在加载价格数据...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <p className="text-sm">{error}</p>
      </Alert>
    );
  }

  return (
    <Card gradient className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-lg text-white/80">
          实时 SOL/USD 价格
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* 主要价格显示 */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold text-white">
              ${price?.toFixed(2)}
            </span>
            {previousPrice !== null && (
              <span className={`text-3xl font-bold ${getPriceChangeColor()}`}>
                {getPriceChangeArrow()}
              </span>
            )}
          </div>

          {/* 价格变化详情 */}
          {previousPrice !== null && price !== null && (
            <p className={`text-sm ${getPriceChangeColor()}`}>
              {priceChange === "up" ? "+" : priceChange === "down" ? "-" : ""}
              ${Math.abs(price - previousPrice).toFixed(4)} (
              {(((price - previousPrice) / previousPrice) * 100).toFixed(2)}%)
            </p>
          )}

          {/* 置信区间 */}
          {confidence !== null && (
            <p className="text-xs text-white/60">
              置信区间: ±${confidence.toFixed(4)}
            </p>
          )}

          {/* 最后更新时间 */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">
              最后更新: {lastUpdateTime} • 每 {PRICE_UPDATE_INTERVAL / 1000} 秒自动刷新
            </p>
            <p className="text-xs text-white/40 mt-1 italic">
              数据来源: Pyth Network Hermes API
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
