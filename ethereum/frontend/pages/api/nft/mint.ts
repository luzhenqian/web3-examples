import { NextApiRequest, NextApiResponse } from "next";
import { commonErrors } from "../../../errors";
import { prisma } from "../../../prisma/db";
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
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    try {
      const result = await prisma.noahNFT.findFirst({
        where: {
          owner: null,
        },
      });
      if (!result) {
        return res.status(404).json(commonErrors.notFound);
      }
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }
  }
}
