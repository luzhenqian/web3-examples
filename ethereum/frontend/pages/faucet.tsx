import { useEffect, useState } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContract,
  useSigner,
  useAccount,
} from "wagmi";
import { Alert, Button, Heading, Input, useToast } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { abi } from "@/abi/Faucet.json";

const contract = {
  address: process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS as `0x${string}`,
  abi,
};

const _Faucet = dynamic(() => Promise.resolve(Faucet), { ssr: false });
// @ts-ignore
_Faucet.useWallet = true;
export default _Faucet;

function Faucet() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Withdraw />
      <SetAmountEachTime />
    </div>
  );
}

function Withdraw() {
  const toast = useToast();

  // 查询当前每天领取的数量
  const [amountEachTime, setAmountEachTime] = useState(1);
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const contractInstance = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!contractInstance || !signer) {
      return;
    }
    (async () => {
      const res = await contractInstance.amountEachTime();
      setAmountEachTime(res.toNumber());
    })();
  }, [contractInstance, address, signer]);

  // 领币
  const { config: withdrawConfig, isError: isPrepareError } =
    usePrepareContractWrite({
      ...contract,
      functionName: "withdraw",
    });
  const {
    write,
    data,
    isError: isWriteError,
  } = useContractWrite(withdrawConfig);
  const { isLoading, isError: isWaitTransactionError } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "领取成功",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Heading>领取代币</Heading>

      <Alert status="info">
        <ul>
          <li>每个地址每 24 小时最多只能领取 1 次</li>
          <li>每次可以领取 {amountEachTime} 个 Noah 币</li>
        </ul>
      </Alert>

      <Button
        disabled={isLoading}
        isLoading={isLoading}
        onClick={() => write?.()}
      >
        领取
      </Button>

      {isPrepareError && <Alert status="error">{`该地址目前不可以领取`}</Alert>}
      {isWriteError || isWaitTransactionError ? (
        <Alert status="error">{`领取失败`}</Alert>
      ) : null}
    </div>
  );
}

function SetAmountEachTime() {
  const toast = useToast();

  const { data: signer } = useSigner();
  const { address } = useAccount();
  const contractInstance = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!contractInstance || !signer) {
      return;
    }
    (async () => {
      const res = await contractInstance.owner();
      if (res === address) {
        setIsOwner(true);
      }
    })();
  }, [contractInstance, address, signer]);

  const [isOwner, setIsOwner] = useState(false);

  const [amountEachTime, setAmountEachTime] = useState(0);

  // 设置每次领取的数量
  const { config: setAmountEachTimeConfig } = usePrepareContractWrite({
    ...contract,
    functionName: "setAmountEachTime",
    args: [amountEachTime],
    enabled: isOwner,
  });
  const {
    write,
    data,
    isLoading,
    isError: isWriteError,
  } = useContractWrite(setAmountEachTimeConfig);
  const {
    isLoading: isSetAmountEachTimeLoading,
    isError: isWaitForTransactionError,
  } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "设置成功",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });
  if (!isOwner) return null;
  return (
    <div className="flex flex-col gap-4">
      <Heading>设置每次领取的代币数量</Heading>
      <Input
        value={amountEachTime}
        onInput={(e) => {
          setAmountEachTime(Number(e.currentTarget.value));
        }}
        placeholder="输入新的每次领取 Noah 币数量"
      ></Input>
      <Button
        disabled={isLoading || isSetAmountEachTimeLoading}
        isLoading={isLoading || isSetAmountEachTimeLoading}
        onClick={() => write?.()}
      >
        设置
      </Button>

      {(isWriteError || isWaitForTransactionError) && (
        <Alert status="error">{`设置失败`}</Alert>
      )}
    </div>
  );
}
