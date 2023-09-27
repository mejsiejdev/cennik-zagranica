/*
  Warnings:

  - A unique constraint covering the columns `[lang]` on the table `PriceNotifications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PriceNotifications_lang_key" ON "PriceNotifications"("lang");
