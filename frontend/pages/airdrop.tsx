import { useCallback, useEffect, useState } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContract,
  useSigner,
  useAccount,
} from "wagmi";
import {
  Alert,
  Button,
  Heading,
  Input,
  Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { abi } from "../abi/Airdrop.json";
import Profile from "../components/Profile";
import { ethers } from "ethers";
import { useDropzone } from "react-dropzone";
import { read, utils } from "xlsx";

const contract = {
  address: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as `0x${string}`,
  abi,
};

export default dynamic(() => Promise.resolve(Airdrop), { ssr: false });

function Airdrop() {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const contractInstance = useContract({
    ...contract,
    signerOrProvider: signer,
  });
  useEffect(() => {
    if (!contractInstance || !signer) {
      return;
    }
    (async () => {
      const owner = await contractInstance.owner();
      if (owner === address) {
        setIsOwner(true);
      }
    })();
  }, [contractInstance, address, signer]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <Profile />

      {isOwner ? (
        <OneToMany />
      ) : (
        <Alert status="error">
          <span>只有合约拥有者才可以进行空投</span>
        </Alert>
      )}
    </div>
  );
}

function OneToMany() {
  const [addresses, setAddresses] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const text = reader.result as string;
        setAddresses(text);
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      const binaryStr = reader.result as string;
      const wb = read(binaryStr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = utils.sheet_to_json(ws);
      const addresses = json
        .map(({ address }: any) => address)
        .filter((address) => ethers.utils.isAddress(address))
        .join("\n");
      setAddresses(addresses);
    };
    reader.readAsBinaryString(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 1024 * 1024,
    accept: {
      "text/csv": [".cvs"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/plain": [".txt"],
    },
  });

  const addressesParam = addresses.trim().split("\n");
  const isValid = addressesParam.every((address) =>
    ethers.utils.isAddress(address)
  );

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: "oneToMany",
    args: [addressesParam, amount],
    enabled: isValid && addressesParam.length > 0 && amount > 0,
  });

  const { write, data, isError } = useContractWrite(config);

  const {
    isSuccess,
    isLoading,
    isError: isWaitTransactionError,
  } = useWaitForTransaction({
    hash: data?.hash,
  });
  const toast = useToast();
  useEffect(() => {
    if (isWaitTransactionError) {
      toast({
        title: "空投失败",
        status: "error",
        isClosable: true,
      });
    }
    if (isSuccess) {
      toast({
        title: "空投成功",
        status: "success",
        isClosable: true,
      });
    }
  }, [isSuccess, isWaitTransactionError, toast]);

  return (
    <div className="flex flex-col gap-2">
      <Heading>多个地址使用相同的数量进行空投</Heading>
      <div
        {...getRootProps()}
        className="p-4 border-2 border-gray-300 border-dashed rounded-sm cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖拽文件到这里</p>
        ) : (
          <div>
            <p>拖拽文件到这里，或者点击上传文件</p>
            <p>支持的文件格式：.csv, .xlsx, .xls, .txt</p>
            <p className="text-red-600">
              如果是表格类型的文件，需要将内容放在第一个 sheet
              中，并将第一列命名为
              address。同时保证地址为文本类型，而不是数字类型。
            </p>
          </div>
        )}
      </div>
      <Alert status={isValid ? "info" : "error"}>
        <ul>
          <li>每行代表一个地址</li>
          {!isValid && <li>地址格式不正确</li>}
        </ul>
      </Alert>
      <Textarea
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
        placeholder="请输入要转账的地址"
      ></Textarea>
      <Input
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="请输入要转账的代币数量"
      ></Input>
      <Button
        isLoading={isLoading}
        isDisabled={isLoading}
        onClick={() => write?.()}
      >
        发送
      </Button>
    </div>
  );
}

// TODO: OneToOne