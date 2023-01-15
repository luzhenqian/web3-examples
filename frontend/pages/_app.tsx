import {
  WagmiConfig,
  createClient,
  configureChains,
  mainnet,
  goerli,
} from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig, SWRConfiguration } from "swr";
import axios from "axios";

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

const fetcher = async (url: string) => {
  return (await axios.get(url)).data;
};

const options: SWRConfiguration = {
  refreshInterval: 30000,
  fetcher,
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <WagmiConfig client={client}>
        <ChakraProvider>
          <SWRConfig value={options}>
            <Component {...pageProps} />
          </SWRConfig>
        </ChakraProvider>
      </WagmiConfig>
    </SessionProvider>
  );
}
