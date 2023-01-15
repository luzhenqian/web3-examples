-- AlterTable
ALTER TABLE "NoahNFT" ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "externalUri" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "NFTSync" (
    "id" SERIAL NOT NULL,
    "fromBlockNumber" INTEGER NOT NULL,
    "toBlockNumber" INTEGER NOT NULL,
    "timeConsumed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTSync_pkey" PRIMARY KEY ("id")
);
