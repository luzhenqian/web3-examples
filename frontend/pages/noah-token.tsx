import { useState } from "react";
import {
  WagmiConfig,
  createClient,
  configureChains,
  mainnet,
  useConnect,
  useAccount,
  useEnsAvatar,
  useEnsName,
  useDisconnect,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  goerli,
  useContractRead,
  useContractReads,
  useContractEvent,
  useNetwork,
} from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import {
  Alert,
  Button,
  ChakraProvider,
  Heading,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { abi } from "../abi/NoahToken.json";

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    goerli,
    {
      id: 1337,
      name: "Local",
      network: "Local",
      nativeCurrency: {
        name: "Noah",
        symbol: "NOAH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["http://127.0.0.1:7545"],
        },
      },
    },
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
    }),
    publicProvider(),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

const contract = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi,
};

export default dynamic(() => Promise.resolve(NoahToken), { ssr: false });

function NoahToken() {
  return (
    <ChakraProvider>
      <WagmiConfig client={client}>
        <div className="p-8 flex flex-col gap-8">
          <Profile />
          <Detail />
          <BalanceOf />
          <Transfer />
          <Allowance />
          <Approve />
          <TransferFrom />
        </div>
      </WagmiConfig>
    </ChakraProvider>
  );
}

function Profile() {
  const { address, connector, isConnected } = useAccount();
  const { data: ensAvatar } = useEnsAvatar();
  const { data: ensName } = useEnsName();
  const network = useNetwork();
  console.log(network, "network");
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-1">
        {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
        <div>{ensName ? `${ensName} (${address})` : address}</div>
        <div>连接到 {connector?.name}</div>

        <Button onClick={() => disconnect()}>断开连接</Button>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          disabled={!connector.ready}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && " (不支持)"}
          {isLoading && connector.id === pendingConnector?.id && " (连接中)"}
        </Button>
      ))}

      {error && <Alert status="error">{error.message}</Alert>}
    </div>
  );
}

function Detail() {
  const contract = {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi,
  };
  const { data, error, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "decimals",
      },
      {
        ...contract,
        functionName: "totalSupply",
      },
    ],
  }) as any;

  const [name, symbol, decimals, totalSupply] = data || [];

  return (
    <div>
      <Heading>代币信息</Heading>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div>代币名称：{name && name?.toString()}</div>
          <div>代币代号：{symbol && symbol?.toString()}</div>
          <div>代币精度：{decimals && decimals?.toString()}</div>
          <div>代币总量：{totalSupply && totalSupply?.toString()}</div>
        </>
      )}
      {isError ? (
        <Alert status="error">{`查询失败，失败原因：${error}`}</Alert>
      ) : null}
    </div>
  );
}

function BalanceOf() {
  const [address, setAddress] = useState<string>("");

  const {
    data: balance,
    error,
    isError,
    isLoading,
    refetch,
  } = useContractRead({
    ...contract,
    functionName: "balanceOf",
    args: [address],
  }) as any;

  useContractEvent({
    ...contract,
    eventName: "Transfer",
    listener(from, to, value) {
      if (from === address || to === address) {
        refetch();
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Heading>查询代币余额</Heading>
      <Input
        placeholder="输入钱包地址自动查询代币余额"
        value={address}
        onInput={(e) => setAddress((e.target as any).value)}
      />
      {isLoading ? <Spinner /> : <div>{balance && balance?.toString()}</div>}
      <div>
        {address !== "" && isError && (
          <Alert status="error">{`查询失败，失败原因：${error}`}</Alert>
        )}
      </div>
    </div>
  );
}

function Transfer() {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: "transfer",
    args: [address, amount],
  });

  const {
    data,
    isLoading: isWriteLoading,
    error: writeError,
    write,
    isError: isWriteError,
  } = useContractWrite(config);

  const {
    error: transactionError,
    isLoading: isTransactionLoading,
    isSuccess,
    isError: isTransactionError,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const toast = useToast();

  if (isSuccess) {
    toast({
      title: "转账成功",
      description: `转账成功，交易哈希：${data?.hash}`,
      status: "success",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading>转账</Heading>
      <Input
        value={address}
        onInput={(e) => setAddress((e.target as any).value)}
        placeholder="输入要转账的钱包地址"
      />
      <Input
        value={amount}
        type="number"
        onInput={(e) => setAmount(Number((e.target as any).value))}
        placeholder="输入要转账的代币数量"
      />
      <Button
        disabled={!write || isWriteLoading || isTransactionLoading}
        onClick={() => {
          write?.();
        }}
      >
        转账
      </Button>

      {isWriteError || isTransactionError ? (
        <Alert status="error">
          {`转账失败，失败原因：${writeError || transactionError}`}
        </Alert>
      ) : null}
    </div>
  );
}

function Approve() {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: "approve",
    args: [1, address, amount],
  });

  const {
    data,
    write,
    error: writeError,
    isError: isWriteError,
  } = useContractWrite(config);

  const {
    error: transactionError,
    isError: isTransactionError,
    isLoading: isTransactionLoading,
    isSuccess,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const toast = useToast();

  if (isSuccess) {
    toast({
      title: "授权成功",
      description: `授权成功，交易哈希：${data?.hash}`,
      status: "success",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading>授权</Heading>
      <Input
        value={address}
        onInput={(e) => setAddress((e.target as any).value)}
        placeholder="输入要授权的钱包地址"
      />
      <Input
        value={amount}
        type="number"
        onInput={(e) => setAmount(Number((e.target as any).value))}
        placeholder="输入要授权的代币数量"
      />
      <Button
        disabled={!write || isTransactionLoading}
        onClick={() => {
          write?.();
        }}
      >
        授权
      </Button>

      {isWriteError || isTransactionError ? (
        <Alert status="error">{`授权失败，失败原因：${
          writeError || transactionError
        }`}</Alert>
      ) : null}
    </div>
  );
}

function Allowance() {
  const [owner, setOwner] = useState<string>("");
  const [spender, setSpender] = useState<string>("");
  const { data, error, refetch, isError } = useContractRead({
    ...contract,
    functionName: "allowance",
    args: [owner, spender],
  }) as any;

  useContractEvent({
    ...contract,
    eventName: "Approval",
    listener(from, to, value) {
      if (from === owner || to === owner) {
        refetch();
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Heading>查询代币授权余额</Heading>
      <Input
        placeholder="输入授权人地址"
        value={owner}
        onInput={(e) => setOwner((e.target as any).value)}
      />
      <Input
        placeholder="输入被授权人地址"
        value={spender}
        onInput={(e) => setSpender((e.target as any).value)}
      />
      <div>{data ? data?.toString() : "输入地址自动显示授权余额"}</div>

      {owner !== "" && spender !== "" && isError ? (
        <Alert status="error">{`查询失败，失败原因：${error}`}</Alert>
      ) : null}
    </div>
  );
}

function TransferFrom() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: "approve",
    args: [from, to, amount],
  });

  const {
    data,
    write,
    error: writeError,
    isError: isWriteError,
  } = useContractWrite(config);

  const {
    error: transactionError,
    isError: isTransactionError,
    isLoading,
    isSuccess,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const toast = useToast();

  if (isSuccess) {
    toast({
      title: "转账成功",
      description: `转账成功，交易哈希：${data?.hash}`,
      status: "success",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading>通过授权账户进行转账</Heading>
      <Input
        value={from}
        onInput={(e) => setFrom((e.target as any).value)}
        placeholder="输入已被授权的地址"
      />
      <Input
        value={to}
        onInput={(e) => setTo((e.target as any).value)}
        placeholder="输入咬转账的地址"
      />
      <Input
        value={amount}
        type="number"
        onInput={(e) => setAmount(Number((e.target as any).value))}
        placeholder="输入要授权的代币数量"
      />
      <Button
        disabled={!write || isLoading}
        onClick={() => {
          write?.();
        }}
      >
        转账
      </Button>

      {isWriteError || isTransactionError ? (
        <Alert status="error">{`授权失败，失败原因：${
          writeError || transactionError
        }`}</Alert>
      ) : null}
    </div>
  );
}
