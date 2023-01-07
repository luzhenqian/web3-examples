import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Heading,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Faucet() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Withdraw />
      <Manager />
    </div>
  );
}

function Withdraw() {
  const toast = useToast();
  const [address, setAddress] = useState("");
  const [amountEachTime, setAmountEachTime] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios({
          url: "/api/faucet/config",
          method: "GET",
        });
        setAmountEachTime(res.data.amount);
      } catch (err: any) {}
    })();
  }, []);

  const withdraw = async () => {
    try {
      const res = await axios({
        url: "/api/faucet/withdraw",
        method: "POST",
        data: { address },
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast({
        title: "领取成功",
        status: "success",
        duration: 3000,
      });
    } catch (err: unknown) {
      const title = (err as AxiosError<any>).response?.data.message;
      toast({
        title,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Heading>领取代币</Heading>

      <Alert status="info">
        <ul>
          <li>每个地址每 24 小时最多只能领取 1 次</li>
          <li>每次可以领取 {amountEachTime} 个 Noah 币</li>
        </ul>
      </Alert>

      <Input
        placeholder="输入你的地址"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      ></Input>

      <Button
        // disabled={isLoading}
        // isLoading={isLoading}
        // onClick={() => write?.()}
        onClick={withdraw}
      >
        领取
      </Button>

      {/* {isPrepareError && <Alert status="error">{`该地址目前不可以领取`}</Alert>}
      {isWriteError || isWaitTransactionError ? (
        <Alert status="error">{`领取失败`}</Alert>
      ) : null} */}
    </div>
  );
}

function Manager() {
  const { data: session } = useSession();
  const toast = useToast();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios({
          url: "/api/faucet/config",
          method: "GET",
        });
        console.log(res, "res");

        setAmount(res.data.amount);
      } catch (err: any) {
        if (session) {
          toast({
            title: "获取配置失败",
            status: "error",
            duration: 3000,
          });
        }
      }
    })();
  }, []);

  const setAmountApi = async () => {
    try {
      await axios({
        url: "/api/faucet/config",
        method: "POST",
        data: { amount },
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "设置成功",
        status: "success",
        duration: 3000,
      });
    } catch (err: unknown) {
      const title = (err as AxiosError<any>).response?.data.message;
      toast({
        title,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Heading>设置每次领取的代币数量</Heading>
      <Alert status="warning">该功能仅系统管理员可操作</Alert>

      {session ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div>你好 {session.user?.name}</div>
            <Button
              onClick={() => {
                signOut();
              }}
              bgColor={"red.400"}
              size={"sm"}
            >
              退出登录
            </Button>
          </div>

          <div>
            {session.user.role === "ADMIN" ? (
              <div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="输入每次领取的代币数量"
                ></Input>
                <Button onClick={setAmountApi}>设置</Button>
              </div>
            ) : (
              <Alert status="warning">你不是管理员，无权操作</Alert>
            )}
          </div>
        </div>
      ) : (
        <div>
          如果你是管理员，
          <Button
            variant="link"
            onClick={() => {
              signIn();
            }}
          >
            请登录。
          </Button>
        </div>
      )}
    </div>
  );
}
