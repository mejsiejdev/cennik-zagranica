/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `ProductTitle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductTitle_productId_key" ON "ProductTitle"("productId");
