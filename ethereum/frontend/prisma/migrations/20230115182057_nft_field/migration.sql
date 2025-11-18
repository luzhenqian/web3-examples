/*
  Warnings:

  - Made the column `attributes` on table `NoahNFT` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `NoahNFT` required. This step will fail if there are existing NULL values in that column.
  - Made the column `externalUri` on table `NoahNFT` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `NoahNFT` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `NoahNFT` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NoahNFT" ALTER COLUMN "attributes" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "externalUri" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
