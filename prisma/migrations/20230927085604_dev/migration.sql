/*
  Warnings:

  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sent` to the `ProductTitle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_productTitleId_fkey";

-- AlterTable
ALTER TABLE "ProductTitle" ADD COLUMN     "sent" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "Notifications";
