import { FaucetConfig } from "@prisma/client";
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
  invalidAmount: {
    code: 100100,
    message: "数量格式不正确",
  },
  serviceNotAvailable: {
    code: 200000,
    message: "服务暂不可用",
  },
  other: {
    code: 200001,
    message: "未知错误",
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<any> | FaucetConfig>
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    const config = await prisma.faucetConfig.findFirst();
    if (!config) {
      return res.status(500).json({
        code: errors.serviceNotAvailable.code,
        message: errors.serviceNotAvailable.message,
        data: null,
      });
    }
    return res.status(200).json(config);
  }

  if (req.method === "POST") {
    const amount = req.body.amount;
    if (!amount) {
      return res.status(400).json({
        code: errors.other.code,
        message: errors.other.message,
        data: null,
      });
    }
    try {
      // 先查询是否有配置
      const findResult = await prisma.faucetConfig.findFirst();
      // 如果没有配置，就创建
      if (!findResult) {
        const result = await prisma.faucetConfig.create({
          data: {
            amount,
          },
        });
        return res.status(200).json(result);
      }
      // 如果有配置，就更新
      const result = await prisma.faucetConfig.update({
        where: {
          id: findResult.id,
        },
        data: {
          amount,
        },
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        code: errors.other.code,
        message: errors.other.message,
        data: null,
      });
    }
  }
}
