/*
  Warnings:

  - You are about to drop the column `productId` on the `Notifications` table. All the data in the column will be lost.
  - Added the required column `productTitleId` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_productId_fkey";

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "productId",
ADD COLUMN     "productTitleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_productTitleId_fkey" FOREIGN KEY ("productTitleId") REFERENCES "ProductTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
