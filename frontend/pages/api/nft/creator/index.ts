import { NextApiRequest, NextApiResponse } from "next";
import { commonErrors } from "../../../../errors";
import { prisma } from "../../../../prisma/db";
import { NoahNFT } from "@prisma/client";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | NoahNFT;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (req.method === "POST") {
    const nft = req.body;
    if (!nft) {
      return res.status(400).json(commonErrors.other);
    }
    try {
      const result = await prisma.noahNFT.create({
        data: {
          metadataUri: nft.metadataUri,
          creator: nft.creator,
        },
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }
  }
}
