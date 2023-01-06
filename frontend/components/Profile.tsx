import { Alert, Button } from "@chakra-ui/react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useNetwork,
} from "wagmi";

export default function Profile() {
  const { address, connector, isConnected } = useAccount();
  const { data: ensAvatar } = useEnsAvatar();
  const { data: ensName } = useEnsName();
  const network = useNetwork();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-1">
        {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
        <div>{ensName ? `${ensName} (${address})` : address}</div>
        <div>连接到 {connector?.name}</div>
        <div>当前网络 {network?.chain?.name}</div>
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
