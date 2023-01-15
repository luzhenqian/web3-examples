import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/db";
import { NoahNFT } from "@prisma/client";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | NoahNFT
  | NoahNFT[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "GET" && req.method !== "PUT") {
    return res.status(405).end();
  }

  if (req.method === "PUT") {
    const result = await prisma.noahNFT.update({
      where: {
        id: Number(req.query.id as string),
      },
      data: {
        owner: req.body.owner,
        tokenId: req.body.tokenId,
      },
    });
    return res.status(200).json(result);
  }
}
