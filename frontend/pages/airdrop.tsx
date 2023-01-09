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
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
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
        <>
          <OneToMany />
          <OneToOne />
        </>
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

  const onImported = (data: any) => {
    try {
      if (typeof data === "string") {
        setAddresses(data);
      } else if (typeof data === "object") {
        const addresses = data
          .map(({ address }: any) => address)
          .filter((address: string) => ethers.utils.isAddress(address))
          .join("\n");
        setAddresses(addresses);
      }
    } catch (err) {
      toast({
        title: "导入失败",
        status: "error",
      });
    }
  };

  const addressesParam = addresses.trim().split("\n");
  const isAddressValid = addressesParam.every((address) =>
    ethers.utils.isAddress(address)
  );

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: "oneToMany",
    args: [addressesParam, amount],
    enabled: isAddressValid && addressesParam.length > 0 && amount > 0,
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

      <Alert status={isAddressValid ? "info" : "error"}>
        <ul>
          <li>每行代表一个地址</li>
          {!isAddressValid && <li>地址格式不正确</li>}
        </ul>
      </Alert>

      <Alert>
        <div>
          <div>支持文件导入。</div>
          <ul>
            <li>如果是 txt 类型的文件，需要将地址以换行符分隔。</li>
            <li>
              如果是表格类型的文件，需要将内容放在第一个 sheet
              中，并将第一列命名为
              address。同时保证地址为文本类型，而不是数字类型。
            </li>
          </ul>
        </div>
      </Alert>
      <ImportExcel onImported={onImported} />

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

function OneToOne() {
  const [inputData, setInputData] = useState<
    { address: string; amount: number; isValid?: boolean }[]
  >([]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const addresses = inputData.map(({ address }) => address);
  const amounts = inputData.map(({ amount }) => amount);
  const isValid =
    addresses.every((address) => ethers.utils.isAddress(address)) &&
    amounts.every((amount) => amount > 0) &&
    inputData.length > 0;

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: "oneToMany",
    args: [addresses, amounts],
    enabled: isValid,
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

  const onImported = (data: any) => {
    if (typeof data === "string") {
      const result = data.split("\n").map((item) => {
        const [address, amount] = item.split(" ");
        return {
          address,
          amount: Number(amount),
        };
      });
      setInputData(result);
    } else if (typeof data === "object") {
      const result = data
        .filter((item: any) => {
          return (
            item.address &&
            item.amount &&
            ethers.utils.isAddress(item.address) &&
            Number(item.amount) > 0
          );
        })
        .map((item: any) => ({
          address: item.address,
          amount: Number(item.amount),
        }));
      setInputData(result);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Heading>单个地址使用不同的数量进行空投</Heading>

      <Alert>
        <div>
          <div>支持文件导入。</div>
          <ul>
            <li>
              如果是 txt
              类型的文件，需要将地址和数量以空格符分隔，每组数据以换行符分隔。
            </li>
            <li>
              如果是表格类型的文件，需要将内容放在第一个 sheet
              中，并将第一列命名为 address，第二列命名为
              amount。同时保证地址为文本类型，而不是数字类型。
            </li>
          </ul>
        </div>
      </Alert>
      <ImportExcel onImported={onImported} />

      <Table>
        <Thead>
          <Tr>
            <Th>地址</Th>
            <Th className="w-28 md:w-40">数量</Th>
          </Tr>
        </Thead>
        <Tbody>
          {inputData.map(({ address, amount }, idx) => (
            <Tr key={idx}>
              <Td>
                <Input
                  value={address}
                  onChange={(e) => {
                    const newData = [...inputData];
                    newData[idx].address = e.target.value;
                    setInputData(newData);
                  }}
                  borderColor={ethers.utils.isAddress(address) ? "" : "red.500"}
                  placeholder="请输入地址"
                ></Input>
              </Td>
              <Td>
                <Input
                  value={amount}
                  onChange={(e) => {
                    const newData = [...inputData];
                    newData[idx].amount = Number(e.target.value);
                    setInputData(newData);
                  }}
                  borderColor={amount > 0 ? "" : "red.500"}
                  placeholder="请输入数量"
                ></Input>
              </Td>
            </Tr>
          ))}
          <Tr>
            <Td>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="请输入地址"
              ></Input>
            </Td>
            <Td>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="请输入数量"
              ></Input>
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => {
            setInputData([...inputData, { address, amount }]);
          }}
        >
          添加一列
        </Button>
        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !isValid}
          onClick={() => write?.()}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

function ImportExcel({ onImported }: { onImported: (data: any) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const text = reader.result as string;
        onImported(text);
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
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const json = utils.sheet_to_json(ws);
      onImported(json);
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
  return (
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
        </div>
      )}
    </div>
  );
}
