import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { chains, client } from "../libs/wagmi";
import { options } from "../libs/swr";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/simplebar.min.css";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider>
            <SWRConfig value={options}>
              <Component {...pageProps} />
            </SWRConfig>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </SessionProvider>
  );
}
