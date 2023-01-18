import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { abi } from "../../../abi/NoahNFT.json";
import { trimImageBaseUrl } from "../../../libs/image-url";
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

  if (req.query.pk !== process.env.QSTASH_PK) {
    return res.status(401).end();
  }

  // 记录同步时间
  const now = performance.now();
  // 获取上一次同步信息
  const lastSync = await prisma.nFTSync.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  // 获取上一次同步截止区块编号
  const fromBlockNumber = lastSync?.toBlockNumber || 0;

  // 创建 JsonRpcProvider
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.JSON_RPC_URL as string,
    Number(process.env.CHAIN_ID as string)
  );
  // 创建钱包，并连接到 JsonRpcProvider
  const wallet = new ethers.Wallet(
    process.env.WALLET_PRIVATE_KEY as string
  ).connect(provider);

  // 读取最大区块编号
  const latestBlockNumber = await provider.getBlockNumber();

  // 如果最大区块编号小于上一次同步截止区块编号，说明没有新的区块产生，直接返回
  if (fromBlockNumber >= latestBlockNumber) {
    return res.status(200).json([]);
  }

  // 读取 blockchain log
  const logs = await provider.getLogs({
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
    fromBlock: fromBlockNumber,
    topics: [ethers.utils.id("Transfer(address,address,uint256)")],
  });
  // 扫描截止区块编号
  const toBlockNumber = (logs[logs.length - 1] as any).blockNumber;
  // 解析 log
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
    abi,
    wallet
  );
  const iface = contract.interface;
  const events = logs.map((log) => {
    return iface.parseLog(log);
  });
  if (events.length === 0) {
    return res.status(200).json([]);
  }

  const promises = events.map(async ({ args: { from, to, tokenId } }) => {
    return {
      from,
      tokenId,
      to,
    };
  });
  const transferInfos = await Promise.all(promises);
  try {
    // mint 的情况下
    const mintPromises = transferInfos
      .filter(async (info) => {
        return info.from === "0x0000000000000000000000000000000000000000";
      })
      .map(async (info) => {
        // 通过 metadata uri 匹配 nft
        const tokenURI = (await contract.tokenURI(info.tokenId)) as string;
        const nft = await prisma.noahNFT.findFirst({
          where: {
            metadataUri: trimImageBaseUrl(tokenURI),
            owner: null,
          },
        });
        if (nft) {
          await prisma.noahNFT.update({
            where: {
              id: nft.id,
            },
            data: {
              owner: info.to,
              tokenId: info.tokenId.toNumber(),
            },
          });
        }
      });

    await Promise.all(mintPromises);

    // 查找需要更新的 nft 列表
    const NFTs = await prisma.noahNFT.findMany({
      where: {
        tokenId: {
          in: transferInfos.map((info) => info.tokenId.toNumber()),
        },
      },
    });

    // 更新 nft 信息，交易的情况
    const updatePromises = NFTs.map(async (nft) => {
      const transfer = transferInfos.find(
        (transfer) => transfer.tokenId.toNumber() === nft.tokenId
      );
      if (transfer) {
        await prisma.noahNFT.update({
          where: {
            id: nft.id,
          },
          data: {
            owner: transfer.to,
          },
        });
      }
    });
    await Promise.all(updatePromises);

    // 计算同步耗时
    const end = performance.now();
    const timeConsumed = Math.floor(end - now);
    // 同步 scan 信息
    const ret = await prisma.nFTSync.create({
      data: {
        fromBlockNumber,
        toBlockNumber,
        timeConsumed,
      },
    });
    return res.status(200).json(ret);
  } catch (e) {
    console.log(e);
  }

  res.status(200).json(transferInfos);
}
