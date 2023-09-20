-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "ean" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTitle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "newPrice" TEXT NOT NULL,
    "oldPrice" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_variantId_key" ON "Product"("variantId");

-- AddForeignKey
ALTER TABLE "ProductTitle" ADD CONSTRAINT "ProductTitle_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
