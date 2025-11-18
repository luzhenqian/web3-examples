import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../prisma/db";
import { CreatorRequest } from "@prisma/client";
import { creatorRequestErrors } from "../../../../errors/creator";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | CreatorRequest;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    const result = await prisma.creatorRequest.findFirst({
      where: {
        address: req.query.address as string,
      },
    });
    if (!result) {
      return res.status(404).json(creatorRequestErrors.isNotCreator);
    }
    return res.status(200).json(result);
  }
}
