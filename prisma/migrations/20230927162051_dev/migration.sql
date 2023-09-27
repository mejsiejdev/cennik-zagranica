/*
  Warnings:

  - You are about to drop the column `differenceAt` on the `ProductTitle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductTitle" DROP COLUMN "differenceAt",
ADD COLUMN     "priceDifferenceAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PriceNotifications" (
    "id" SERIAL NOT NULL,
    "isSent" BOOLEAN NOT NULL,
    "lang" TEXT NOT NULL,
    "productTitleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceNotifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PriceNotifications" ADD CONSTRAINT "PriceNotifications_productTitleId_fkey" FOREIGN KEY ("productTitleId") REFERENCES "ProductTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
