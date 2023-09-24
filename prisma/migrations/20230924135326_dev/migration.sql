/*
  Warnings:

  - Added the required column `priceDifference` to the `ProductTitle` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `newPrice` on the `ProductTitle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `oldPrice` on the `ProductTitle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProductTitle" ADD COLUMN     "priceDifference" DOUBLE PRECISION NOT NULL,
DROP COLUMN "newPrice",
ADD COLUMN     "newPrice" DOUBLE PRECISION NOT NULL,
DROP COLUMN "oldPrice",
ADD COLUMN     "oldPrice" DOUBLE PRECISION NOT NULL;
