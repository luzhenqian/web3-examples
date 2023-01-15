/*
  Warnings:

  - You are about to drop the `MinterRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MinterRequest";

-- CreateTable
CREATE TABLE "CreatorRequest" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorRequest_pkey" PRIMARY KEY ("id")
);
