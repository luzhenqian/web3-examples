import { NextApiRequest, NextApiResponse } from "next";
import { commonErrors } from "../../../errors";
import { prisma } from "../../../prisma/db";
import { NoahNFT } from "@prisma/client";
import { addImageBaseUrl } from "../../../libs/image-url";

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
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }

  if (req.method === "GET") {
    if (req.query.owner) {
      const result = await prisma.noahNFT.findMany({
        where: {
          owner: req.query.owner as string,
        },
      });
      const resData: NoahNFT[] = mapping(result);
      return res.status(200).json(resData);
    }

    const result = await prisma.noahNFT.findMany();
    const resData: NoahNFT[] = mapping(result);
    return res.status(200).json(resData);
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
          name: nft.name,
          description: nft.description,
          image: nft.image,
          externalUri: nft.external_uri,
          attributes: nft.attributes,
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

function mapping(NFTs: NoahNFT[]) {
  return NFTs.map((NFT) => {
    NFT.image = addImageBaseUrl(NFT.image);
    return NFT;
  });
}
