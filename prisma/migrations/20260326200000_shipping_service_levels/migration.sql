ALTER TABLE "shipping_methods"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "minDeliveryDays" INTEGER,
ADD COLUMN "maxDeliveryDays" INTEGER;
