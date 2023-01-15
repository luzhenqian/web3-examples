/*
  Warnings:

  - Added the required column `creator` to the `NoahNFT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NoahNFT" ADD COLUMN     "creator" TEXT NOT NULL;
