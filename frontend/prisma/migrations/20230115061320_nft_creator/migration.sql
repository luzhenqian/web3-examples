/*
  Warnings:

  - You are about to drop the `NFT` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NFT";

-- CreateTable
CREATE TABLE "NoahNFT" (
    "id" SERIAL NOT NULL,
    "owner" TEXT,
    "tokenId" INTEGER,
    "metadataUri" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoahNFT_pkey" PRIMARY KEY ("id")
);
