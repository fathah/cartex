ALTER TABLE "variant_markets"
ADD COLUMN "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reservedQuantity" INTEGER NOT NULL DEFAULT 0;

UPDATE "variant_markets" vm
SET "inventoryQuantity" = COALESCE(i."quantity", 0),
    "reservedQuantity" = COALESCE(i."reserved", 0)
FROM "inventories" i
WHERE i."variantId" = vm."variantId";
