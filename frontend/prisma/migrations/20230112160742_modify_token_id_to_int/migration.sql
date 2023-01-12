/*
  Warnings:

  - Changed the type of `tokenId` on the `NFT` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "NFT" DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" INTEGER NOT NULL;
