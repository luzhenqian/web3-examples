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
import { utils, writeFile } from "xlsx";

export default function WalletGenerator() {
  const [generateNum, setGenerateNum] = useState<number>(1);
  const [wallets, setWallets] = useState<ethers.Wallet[]>([]);
  const { onCopy, value, setValue, hasCopied } = useClipboard("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const generate = () => {
    const _wallets: ethers.Wallet[] = [];
    setIsLoading(true);
    setTimeout(() => {
      for (let i = 0; i < generateNum; i++) {
        const wallet = ethers.Wallet.createRandom();
        _wallets.push(wallet);
      }
      setWallets(_wallets);
      setIsLoading(false);
    }, 300);
  };

  const exports = () => {
    // 创建一个 book
    const book = utils.book_new();
    //
    const data = wallets.map(
      ({ address, publicKey, privateKey, mnemonic: { phrase } }) => ({
        address,
        publicKey,
        privateKey,
        phrase,
      })
    );
    // 将钱包信息写入 sheet
    const sheet = utils.json_to_sheet(data);
    sheet["!cols"] = [
      {
        wch: 50,
      },
      {
        wch: 140,
      },
      {
        wch: 70,
      },
      {
        wch: 80,
      },
    ];
    // 将 sheet 添加到 book
    utils.book_append_sheet(book, sheet);
    // 下载文件
    writeFile(book, "addresses.xlsx");
  };

  return (
    <div className="flex flex-col gap-2 p-4 ">
      <Heading>钱包地址生成器</Heading>
      <Heading size={"sm"}>生成数量</Heading>
      <Alert>一次最多生成 100 个钱包地址，如果生成过多会导致浏览器卡死。</Alert>
      <Input
        type="number"
        value={generateNum}
        max={100}
        onChange={(e) => {
          setGenerateNum(Number(e.target.value));
        }}
        placeholder="请输入生成数量"
      />
      <Button
        onClick={generate}
        bgColor="blue.300"
        disabled={isLoading}
        isLoading={isLoading}
      >
        开始生成
      </Button>

      {wallets.length > 0 && <Button onClick={exports}>批量导出</Button>}
      <div className="flex flex-col gap-2">
        <Accordion>
          {wallets.map((wallet) => {
            return (
              <AccordionItem
                key={wallet.privateKey}
                className="flex flex-col gap-2"
              >
                <AccordionButton>
                  <Heading size="md">{wallet.address}</Heading>
                </AccordionButton>
                <AccordionPanel className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="w-12">地址</p>
                    <Input className="flex-1" value={wallet.address} readOnly />
                    <Button
                      onClick={() => {
                        setValue(wallet.address);
                        onCopy();
                      }}
                    >
                      {hasCopied && value === wallet.address
                        ? "复制成功!"
                        : "复制"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="w-12">公钥</p>
                    <Input
                      className="flex-1"
                      value={wallet.publicKey}
                      readOnly
                    />
                    <Button
                      onClick={() => {
                        setValue(wallet.publicKey);
                        onCopy();
                      }}
                    >
                      {hasCopied && value === wallet.publicKey
                        ? "复制成功!"
                        : "复制"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="w-12">私钥</p>
                    <Input
                      className="flex-1"
                      value={wallet.privateKey}
                      readOnly
                    />
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
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
