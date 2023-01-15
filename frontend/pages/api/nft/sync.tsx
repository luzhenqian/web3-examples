import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { abi } from "../../../abi/NoahNFT.json";
import { prisma } from "../../../prisma/db";

type Response<T> =
  | {
      code: number;
      message: string;
      data: T;
    }
  | any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
  // 读取 blockchain log
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.JSON_RPC_URL as string,
    Number(process.env.CHAIN_ID as string)
  );
  const logs = await provider.getLogs({
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
    fromBlock: 0,
    topics: [ethers.utils.id("Transfer(address,address,uint256)")],
  });
  // 解析 log
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
    abi
  );
  const iface = contract.interface;
  const events = logs.map((log) => {
    return iface.parseLog(log);
  });
  const promises = events.map(async ({ args: { from, to, tokenId } }) => {
    return {
      from,
      tokenId,
      to,
    };
  });
  const transferInfo = await Promise.all(promises);
  try {
    // 同步 nft 信息
    const NFTs = await prisma.noahNFT.findMany({
      where: {
        tokenId: {
          in: transferInfo.map((info) => info.tokenId.toNumber()),
        },
      },
    });
    console.log(NFTs, "nfts");

    // 同步 scan 信息
  } catch (e) {
    console.log(e);
  }

  res.status(200).json(transferInfo);
}
