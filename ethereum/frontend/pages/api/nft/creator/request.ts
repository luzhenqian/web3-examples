import { NextApiRequest, NextApiResponse } from "next";
import { commonErrors } from "../../../../errors";
import { prisma } from "../../../../prisma/db";
import { CreatorRequest } from "@prisma/client";
import { creatorRequestErrors } from "../../../../errors/creator";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | CreatorRequest
  | CreatorRequest[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    const address = req.query.address;
    console.log("address", address);
    try {
      const result = await prisma.creatorRequest.findMany({
        where: {
          address: address as string,
          status: 'passed'
        },
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }
  }

  if (req.method === "POST") {
    const request = req.body;
    if (!request) {
      return res.status(400).json(commonErrors.other);
    }

    const record = await prisma.creatorRequest.findFirst({
      where: {
        address: request.address,
        status: "pending",
      },
    });

    if (record) {
      return res.status(400).json(creatorRequestErrors.cannotReapply);
    }

    try {
      const result = await prisma.creatorRequest.create({
        data: request,
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }
  }
}
