import { NextApiRequest, NextApiResponse } from "next";
import { commonErrors } from "../../../errors";
import { prisma } from "../../../prisma/db";
import { MinterRequest } from "@prisma/client";
import { minterRequestErrors } from "../../../errors/minter-request";

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | MinterRequest
  | MinterRequest[];

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
      const result = await prisma.minterRequest.findMany({
        where: {
          address: address as string,
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

    const record = await prisma.minterRequest.findFirst({
      where: {
        address: request.address,
        status: "pending",
      },
    });

    if (record) {
      return res.status(400).json(minterRequestErrors.cannotReapply);
    }

    try {
      const result = await prisma.minterRequest.create({
        data: request,
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }
  }
}
