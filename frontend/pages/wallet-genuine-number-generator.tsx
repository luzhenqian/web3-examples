import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Alert,
  Button,
  Heading,
  Input,
  useClipboard,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState } from "react";

export default function WalletGenerator() {
  const [startChar, setStartChar] = useState<string>("");
  const [includeChar, setIncludeChar] = useState<string>("");
  const [endChar, setEndChar] = useState<string>("");
  const [wallet, setWallet] = useState<ethers.Wallet>();
  const { onCopy, value, setValue, hasCopied } = useClipboard("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const generate = () => {
    let _wallet: ethers.Wallet | null = null;
    setIsLoading(true);
    setWallet(void 0);
    setTimeout(() => {
      const match = new RegExp(`^0x${startChar}.*${includeChar}.*${endChar}$`);

      while (true) {
        const wallet = ethers.Wallet.createRandom();
        if (match.test(wallet.address)) {
          _wallet = wallet;
          break;
        }
      }

      setWallet(_wallet);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-2 p-4 ">
      <Heading>钱包地址靓号生成器</Heading>
      <Alert>条件越苛刻，生成速度越慢</Alert>
      <Heading size={"sm"}>输入开头号码</Heading>
      <Input
        type="number"
        value={startChar}
        onChange={(e) => {
          setStartChar(e.target.value);
        }}
        placeholder="请输入开头号码"
      />
      <Heading size={"sm"}>输入包含号码</Heading>
      <Input
        type="number"
        value={includeChar}
        max={100}
        onChange={(e) => {
          setIncludeChar(e.target.value);
        }}
        placeholder="请输入包含号码"
      />
      <Heading size={"sm"}>输入结尾号码</Heading>
      <Input
        type="number"
        value={endChar}
        max={100}
        onChange={(e) => {
          setEndChar(e.target.value);
        }}
        placeholder="请输入结尾号码"
      />
      <Button
        onClick={generate}
        bgColor="blue.300"
        disabled={isLoading}
        isLoading={isLoading}
      >
        开始生成
      </Button>
      <div className="flex flex-col gap-2">
        {wallet && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="w-12">地址</p>
              <Input className="flex-1" value={wallet.address} readOnly />
              <Button
                onClick={() => {
                  setValue(wallet.address);
                  onCopy();
                }}
              >
                {hasCopied && value === wallet.address ? "复制成功!" : "复制"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <p className="w-12">私钥</p>
              <Input className="flex-1" value={wallet.privateKey} readOnly />
              <Button
                onClick={() => {
                  setValue(wallet.privateKey);
                  onCopy();
                }}
              >
                {hasCopied && value === wallet.privateKey
                  ? "复制成功!"
                  : "复制"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <p className="w-12">助记词</p>
              <Input
                className="flex-1"
                value={wallet.mnemonic.phrase}
                readOnly
              />
              <Button
                onClick={() => {
                  setValue(wallet.mnemonic.phrase);
                  onCopy();
                }}
              >
                {hasCopied && value === wallet.mnemonic.phrase
                  ? "复制成功!"
                  : "复制"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
