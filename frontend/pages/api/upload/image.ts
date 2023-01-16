import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import { commonErrors } from "../../../errors";
import { uploadErrors } from "../../../errors/upload";

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

  const form = new formidable.IncomingForm();
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      console.error("Error", err);
      return res.status(500).json(commonErrors.other);
    }

    try {
      const { file } = files;
      const stream = fs.createReadStream(file.filepath);

      if (!file.mimetype.startsWith("image/")) {
        return res.status(500).json(uploadErrors.fileInvalid);
      }

      const { IpfsHash } = await pinata.pinFileToIPFS(stream, {
        pinataMetadata: {
          name: `Noah-NFT-Image-${Date.now()}-${Math.random()}`,
        },
      });

      res.json({
        uri: IpfsHash,
      });
    } catch (e) {
      console.error(e, "e");
      res.status(500).json(commonErrors.other);
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
