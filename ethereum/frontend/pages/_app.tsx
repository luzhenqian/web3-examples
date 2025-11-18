import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { Layout } from "@/components/Layout/Layout";
import { chains, client } from "@/libs/wagmi";
import { options } from "@/libs/swr";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/simplebar.min.css";
import "@/styles/globals.css";
import { GTag } from "@/components/Gtag";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const useLayout = router.route !== "/";
  const ILayout = useLayout
    ? Layout
    : (props: any) => <Fragment>{props.children}</Fragment>;

  return (
    <SessionProvider session={session}>
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider>
            <SWRConfig value={options}>
              <ILayout useWallet={(Component as any).useWallet}>
                <GTag />
                <Component {...pageProps} />
              </ILayout>
            </SWRConfig>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </SessionProvider>
  );
}
