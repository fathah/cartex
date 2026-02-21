-- AlterTable
ALTER TABLE "products" ADD COLUMN     "productBrandId" TEXT;

-- CreateTable
CREATE TABLE "product_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_brands_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "product_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
