import { NextApiRequest, NextApiResponse } from "next";
import { FaucetConfig } from "@prisma/client";
import { prisma } from "../../../prisma/db";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { commonErrors } from "../../../errors";

type Response = {
  code: number;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response | FaucetConfig>
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    const config = await prisma.faucetConfig.findFirst();
    if (!config) {
      return res.status(500).json(commonErrors.serviceNotAvailable);
    }
    return res.status(200).json(config);
  }

  if (req.method === "POST") {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).end();
    }
    const amount = req.body.amount;
    if (!amount) {
      return res.status(400).json(commonErrors.other);
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
      return res.status(500).json(commonErrors.other);
    }
  }
}
