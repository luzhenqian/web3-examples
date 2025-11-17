"use client";

import { useState, useEffect } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";
import { SOL_PRICE_FEED_ID, HERMES_URL, PRICE_UPDATE_INTERVAL } from "@/lib/solana/config";

interface SolAmountPreviewProps {
  usdAmount: number | undefined;
}

export function SolAmountPreview({ usdAmount }: SolAmountPreviewProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);

  const fetchPriceAndCalculate = async () => {
    try {
      const hermesClient = new HermesClient(HERMES_URL);
      const priceData = await hermesClient.getLatestPriceUpdates(
        [SOL_PRICE_FEED_ID],
        { encoding: "base64" }
      );

      if (priceData.parsed && priceData.parsed.length > 0) {
        const parsedPrice = priceData.parsed[0].price;
        const actualPrice = Number(parsedPrice.price) * Math.pow(10, parsedPrice.expo);
        setPrice(actualPrice);

        if (usdAmount && usdAmount > 0) {
          const calculatedSol = usdAmount / actualPrice;
          setSolAmount(calculatedSol);
        } else {
          setSolAmount(null);
        }
      }
    } catch (err: any) {
      console.error("价格获取错误:", err);
    }
  };

  useEffect(() => {
    fetchPriceAndCalculate();
    const intervalId = setInterval(fetchPriceAndCalculate, PRICE_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [usdAmount]);

  if (!usdAmount || usdAmount <= 0) {
    return null;
  }

  if (!price || !solAmount) {
    return (
      <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10 animate-pulse">
        <p className="text-sm text-white/60 text-center">
          正在计算 SOL 数量...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-success-500/10 to-success-600/5 rounded-lg border border-success-500/30 animate-slide-up">
      <div className="text-center space-y-2">
        <p className="text-sm text-success-200 font-medium">
          预计收到
        </p>
        <p className="text-3xl font-bold text-success-400">
          {solAmount.toFixed(6)} SOL
        </p>
        <p className="text-xs text-white/60">
          按当前价格 ${price.toFixed(2)} 计算
        </p>
      </div>
    </div>
  );
}
