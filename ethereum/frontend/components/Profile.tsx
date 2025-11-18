import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default dynamic(() => Promise.resolve(Profile), { ssr: false });

function Profile() {
  return <ConnectButton></ConnectButton>;
}
