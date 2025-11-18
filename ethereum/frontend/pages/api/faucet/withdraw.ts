import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { abi } from "../../../abi/NoahToken.json";
import { prisma } from "../../../prisma/db";

type Response<T> = {
  code: number;
  message: string;
  data: T;
};

const errors: { [key in string]: { code: number; message: string } } = {
  invalidAddress: {
    code: 100100,
    message: "地址不合法",
  },
  insufficientBalance: {
    code: 100101,
    message: "当前地址不能领取",
  },
  serviceNotAvailable: {
    code: 200000,
    message: "服务暂不可用",
  },
  other: {
    code: 200001,
    message: "未知错误",
  },
  nonWithdrawable: {
    code: 200100,
    message: "水龙头余额不足",
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const { address } = req.body;

  // 检查地址是否合法
  const isAddress = ethers.utils.isAddress(address);
  if (!isAddress) {
    return res.status(400).json({
      code: errors.invalidAddress.code,
      message: errors.invalidAddress.message,
      data: null,
    });
  }

  // 获取水龙头配置
  const config = await prisma.faucetConfig.findFirst();
  if (!config) {
    // 如果没有水龙头配置，意味着不能领币
    return res.status(500).json({
      code: errors.serviceNotAvailable.code,
      message: errors.serviceNotAvailable.message,
      data: null,
    });
  }

  // 初始化合约
  const { contract, wallet } = await initWalletAndContract();

  // 检查水龙头余额
  const balance = await contract.balanceOf(wallet.address);
  const amountEachTime = ethers.BigNumber.from(config.amount);

  // 如果水龙头余额小于每次领取的数量，意味着不能领币
  if (balance.lte(amountEachTime)) {
    return res.status(400).json({
      code: errors.nonWithdrawable.code,
      message: errors.nonWithdrawable.message,
      data: null,
    });
  }

  // 查看领币记录
  const record = await prisma.faucetDrawRecord.findFirst({
    where: {
      address,
    },
  });

  // 如果没有领币记录或者领币记录超过一天，意味着可以领币
  if (
    !record ||
    new Date().getTime() - record.drawTime.getTime() > 24 * 60 * 60 * 1000
  ) {
    // 调用合约领币
    try {
      await contract.transfer(address, amountEachTime); // 如果没有领币记录，创建领币记录
      if (!record) {
        await prisma.faucetDrawRecord.create({
          data: {
            address,
            drawTime: new Date(),
          },
        });
      } else {
        // 如果有领币记录，更新领币时间
        await prisma.faucetDrawRecord.update({
          where: {
            id: record.id,
          },
          data: {
            drawTime: new Date(),
          },
        });
      }
      return res.status(200).end();
    } catch (e) {
      // 领币失败
      return res.status(500).json({
        code: errors.other.code,
        message: errors.other.message,
        data: null,
      });
    }
  } else {
    // 如果领币记录不超过一天，意味着不能领币
    return res.status(400).json({
      code: errors.insufficientBalance.code,
      message: errors.insufficientBalance.message,
      data: null,
    });
  }
}

async function initWalletAndContract() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.JSON_RPC_URL as string,
    1337
  );
  const wallet = new ethers.Wallet(
    process.env.WALLET_PRIVATE_KEY as string
  ).connect(provider);
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as string,
    abi,
    wallet
  );
  return { wallet, contract };
}
