import { NextApiRequest, NextApiResponse } from "next";
import pinataSDK from "@pinata/sdk";
import { commonErrors } from "../../../errors";

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

type Response<T> =
  | {
      code: number;
      message: string;
      data?: T;
    }
  | {
      uri: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<null>>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { IpfsHash } = await pinata.pinJSONToIPFS(req.body, {
      pinataMetadata: {
        name: `Noah-NFT-Metadata-${Date.now()}-${Math.random()}`,
      },
    });
    return res.status(200).json({ uri: IpfsHash });
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json(commonErrors.other);
  }
}
