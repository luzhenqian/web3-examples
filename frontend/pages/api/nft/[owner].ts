import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/db";
import { NFT } from "@prisma/client";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | NFT[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    const result = await prisma.nFT.findMany({
      where: {
        owner: req.query.owner as string,
      },
    });
    return res.status(200).json(result);
  }
}
