import { ethers } from "ethers";
import { Dialog } from "@headlessui/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";

type IWalletCtx = {
  walletProvider: any;
  setWalletProvider: (walletProvider: any) => void;
  msgIsOpen: boolean;
  setMsgIsOpen: (msgIsOpen: boolean) => void;
  msg: string;
  setMsg: (msg: string) => void;
  account: string;
  setAccount: (account: string) => void;
  networkName: string;
  setNetworkName: (networkName: string) => void;
  balance: string;
  setBalance: (balance: string) => void;
  showMessage: (message: string) => void;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
};

const WalletCtx = createContext<IWalletCtx>({} as IWalletCtx);

export default dynamic(() => Promise.resolve(Wallet), { ssr: false });

function Wallet() {
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [msgIsOpen, setMsgIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [account, setAccount] = useState<string>("");
  const [networkName, setNetworkName] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    setWalletProvider(
      new ethers.providers.Web3Provider(window.ethereum as any)
    );
  }, []);

  const showMessage = (message: string) => {
    setMsg(message);
    setMsgIsOpen(true);
    setTimeout(() => {
      setMsg("");
      setMsgIsOpen(false);
    }, 2000);
  };

  if (!window.ethereum) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-thin">
          Please install{" "}
          <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">
            MetaMask
          </a>
        </h1>
      </div>
    );
  }

  return (
    <WalletCtx.Provider
      value={{
        walletProvider,
        setWalletProvider,
        msgIsOpen,
        setMsgIsOpen,
        msg,
        setMsg,
        account,
        setAccount,
        networkName,
        setNetworkName,
        balance,
        setBalance,
        showMessage,
        refresh,
        setRefresh,
      }}
    >
      <div className="flex flex-col gap-4 p-4">
        <Dialog open={msgIsOpen} as={"div"} onClose={() => setMsgIsOpen(false)}>
          <div className="fixed flex items-center justify-center w-full top-2">
            <Dialog.Panel className="inline-flex flex-col p-4 bg-green-400 shadow-xl text-slate-600 rounded-3xl">
              <Dialog.Title>{msg}</Dialog.Title>
            </Dialog.Panel>
          </div>
        </Dialog>
        <Connect />
        <Details />
        <Transfer />
      </div>
    </WalletCtx.Provider>
  );
}

function Connect() {
  const {
    walletProvider,
    account,
    setAccount,
    setNetworkName,
    setBalance,
    showMessage,
    refresh,
  } = useContext(WalletCtx);

  const refreshBalance = useCallback(async () => {
    if (!walletProvider || !account) return;
    const balance = await walletProvider.getBalance(account);
    setBalance(ethers.utils.formatEther(balance));
  }, [setBalance, walletProvider, account]);

  useEffect(() => {
    refreshBalance();
  }, [refresh, refreshBalance]);

  const connectToMetamask = async () => {
    try {
      const accounts = await walletProvider.send("eth_requestAccounts", []);
      const network = await walletProvider.getNetwork();
      const balance = await walletProvider.getBalance(accounts[0]);
      setAccount(accounts[0]);
      setNetworkName(network.name);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
      showMessage("failed to connect to metamask");
    }
  };

  const disconnect = async () => {
    setAccount("");
  };

  if (!account) {
    return (
      <div className="flex justify-end p-4">
        {walletProvider ? (
          <button className="btn" onClick={connectToMetamask}>
            connect to metamask
          </button>
        ) : (
          <Loading />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <h1 className="text-end">
        Hello,{" "}
        {account.substring(0, 5) +
          "..." +
          account.substring(account.length - 4, account.length)}
      </h1>
      <button className="btn" onClick={disconnect}>
        disconnect
      </button>
    </div>
  );
}

function Details() {
  const { account, networkName, balance } = useContext(WalletCtx);
  if (!account) {
    return null;
  }
  return (
    <div className="flex flex-col w-full gap-4 p-4 text-white rounded-md bg-slate-800">
      <div className="flex justify-between">
        <div className="text-2xl font-thin">balance</div>
        <div>network: {networkName}</div>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-2xl">{balance.substring(0, 10)}</div>
        <div>ETH</div>
      </div>
    </div>
  );
}

function Transfer() {
  const { walletProvider, account, showMessage, refresh, setRefresh } =
    useContext(WalletCtx);
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transferring, setTransferring] = useState<boolean>(false);

  const transfer = async () => {
    try {
      const value = ethers.utils.parseEther(amount);
      const signer = walletProvider.getSigner();

      const tx = {
        to,
        value,
      };
      setTransferring(true);
      const receipt = await signer.sendTransaction(tx);
      await receipt.wait();
      setTo("");
      setAmount("");
      showMessage("successfully transferred");
    } catch (error) {
      console.log(error);
      showMessage("failed to transfer");
    } finally {
      setTransferring(false);
      setRefresh(!refresh);
    }
  };

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="text-4xl font-bold">Transfer</div>
      {transferring ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl">transferring...</div>
          <Loading size="xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            className="input"
            value={to}
            onInput={(e: any) => setTo(e.target.value)}
            type="text"
            placeholder="address"
          />
          <input
            className="input"
            value={amount}
            onInput={(e: any) => setAmount(e.target.value)}
            type="number"
            placeholder="amount"
          />
          <button className="btn" onClick={transfer}>
            send
          </button>
        </div>
      )}
    </div>
  );
}

function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7",
    xl: "h-9 w-9",
  };
  return (
    <svg
      className={`animate-spin -ml-1 mr-3 ${sizes[size]} text-black`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
