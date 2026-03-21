/*
  Warnings:

  - You are about to drop the column `originalPrice` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `variant_markets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "originalPrice";

-- AlterTable
ALTER TABLE "variant_markets" DROP COLUMN "originalPrice";
