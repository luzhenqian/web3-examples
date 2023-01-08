import { useEffect, useState } from "react";
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
