CREATE TYPE "ShippingRateApplicationType" AS ENUM ('BASE', 'SURCHARGE');

CREATE TYPE "ShippingMethodSourceType" AS ENUM ('MANUAL', 'CARRIER');

CREATE TABLE "shipping_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "handlingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_profiles_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "products"
ADD COLUMN "shippingProfileId" TEXT;

ALTER TABLE "product_variants"
ADD COLUMN "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "weightGrams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lengthCm" DECIMAL(10,2),
ADD COLUMN "widthCm" DECIMAL(10,2),
ADD COLUMN "heightCm" DECIMAL(10,2);

ALTER TABLE "shipping_methods"
ADD COLUMN "sourceType" "ShippingMethodSourceType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "providerCode" TEXT,
ADD COLUMN "providerServiceCode" TEXT;

ALTER TABLE "shipping_rates"
ADD COLUMN "shippingProfileId" TEXT,
ADD COLUMN "applicationType" "ShippingRateApplicationType" NOT NULL DEFAULT 'BASE',
ADD COLUMN "minWeightGrams" INTEGER,
ADD COLUMN "maxWeightGrams" INTEGER;

INSERT INTO "shipping_profiles" (
  "id",
  "name",
  "code",
  "description",
  "isDefault",
  "handlingFee",
  "createdAt",
  "updatedAt"
)
SELECT
  'default_shipping_profile',
  'Standard Items',
  'STANDARD',
  'Default shipping profile for regular shippable products.',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM "shipping_profiles"
  WHERE "code" = 'STANDARD'
);

UPDATE "products"
SET "shippingProfileId" = (
  SELECT "id" FROM "shipping_profiles" WHERE "code" = 'STANDARD' LIMIT 1
)
WHERE "shippingProfileId" IS NULL;

CREATE UNIQUE INDEX "shipping_profiles_code_key" ON "shipping_profiles"("code");
CREATE UNIQUE INDEX "shipping_profiles_isDefault_key" ON "shipping_profiles"("isDefault") WHERE "isDefault" = true;
CREATE INDEX "products_shippingProfileId_idx" ON "products"("shippingProfileId");
CREATE INDEX "shipping_rates_shippingProfileId_shippingMethodId_idx" ON "shipping_rates"("shippingProfileId", "shippingMethodId");

ALTER TABLE "products"
ADD CONSTRAINT "products_shippingProfileId_fkey"
FOREIGN KEY ("shippingProfileId") REFERENCES "shipping_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "shipping_rates"
ADD CONSTRAINT "shipping_rates_shippingProfileId_fkey"
FOREIGN KEY ("shippingProfileId") REFERENCES "shipping_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
