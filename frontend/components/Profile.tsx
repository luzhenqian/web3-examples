import { Alert, Button } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

const supportedChainIds = [
  5, // Goerli
];

if (process.env.NEXT_PUBLIC_ENV === "development") {
  supportedChainIds.push(1337); // Localhost
}

export default dynamic(() => Promise.resolve(Profile), { ssr: false });

function Profile() {
  const { address, connector, isConnected } = useAccount();
  const { data: ensAvatar } = useEnsAvatar();
  const { data: ensName } = useEnsName();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const {
    chains,
    error: switchNetworkError,
    isLoading: isSwitchNetworkLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-1">
        {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
        <div>{ensName ? `${ensName} (${address})` : address}</div>

        <div>连接到 {connector?.name}</div>
        <div>当前网络 {chain?.name}</div>
        <Button onClick={() => disconnect()}>断开连接</Button>
        {chain && !supportedChainIds.includes(chain?.id) && (
          <div className="flex items-center gap-2">
            <div>当前网络不支持，请切换到以下网络：</div>
            {chains
              .filter((chain) => supportedChainIds.includes(chain.id))
              .map((chain) => (
                <Button
                  key={chain.id}
                  disabled={isSwitchNetworkLoading}
                  isLoading={
                    isSwitchNetworkLoading && chain.id === pendingChainId
                  }
                  onClick={() => switchNetwork?.(chain.id)}
                  size="sm"
                >
                  {chain.name}
                  {isSwitchNetworkLoading &&
                    chain.id === pendingChainId &&
                    " (切换中)"}
                </Button>
              ))}
            {switchNetworkError && (
              <Alert status="error">{switchNetworkError.message}</Alert>
            )}
          </div>
        )}
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
