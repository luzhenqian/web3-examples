"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SolAmountPreview } from "@/components/price/SolAmountPreview";
import { SendButtons } from "./SendButtons";

export function SendForm() {
  const [destination, setDestination] = useState<PublicKey>();
  const [amount, setAmount] = useState<number>();
  const [destinationInput, setDestinationInput] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [destinationError, setDestinationError] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");

  const handleSetDestination = (value: string) => {
    setDestinationInput(value);
    setDestinationError("");

    try {
      if (value.trim() === "") {
        setDestination(undefined);
        return;
      }
      const pubkey = new PublicKey(value);
      setDestination(pubkey);
    } catch (e) {
      setDestination(undefined);
      if (value.trim() !== "") {
        setDestinationError("无效的 Solana 地址格式");
      }
    }
  };

  const handleSetAmount = (value: string) => {
    setAmountInput(value);
    setAmountError("");

    try {
      if (value.trim() === "") {
        setAmount(undefined);
        return;
      }
      const parsedAmount = parseFloat(value);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setAmount(undefined);
        setAmountError("金额必须大于 0");
      } else {
        setAmount(parsedAmount);
      }
    } catch (e) {
      setAmount(undefined);
      setAmountError("无效的金额格式");
    }
  };

  return (
    <Card gradient>
      <CardHeader>
        <CardTitle>发送 SOL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 收款地址输入 */}
          <Input
            label="收款地址 (Solana 公钥)"
            type="text"
            value={destinationInput}
            onChange={(e) => handleSetDestination(e.target.value)}
            placeholder="例如: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            error={destinationError}
          />

          {/* 金额输入 */}
          <div>
            <Input
              label="金额 (USD)"
              type="number"
              value={amountInput}
              onChange={(e) => handleSetAmount(e.target.value)}
              placeholder="例如: 100"
              min="0"
              step="0.01"
              error={amountError}
            />
            {/* SOL 数量预览 */}
            <SolAmountPreview usdAmount={amount} />
          </div>

          {/* 发送按钮 */}
          <SendButtons destination={destination} amount={amount} />
        </div>
      </CardContent>
    </Card>
  );
}
