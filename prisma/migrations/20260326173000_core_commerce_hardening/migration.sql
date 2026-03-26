-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_event_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "orderId" TEXT,
    "paymentIntentId" TEXT,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_event_logs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "customers"
ADD COLUMN "normalizedEmail" TEXT,
ADD COLUMN "otpHash" TEXT,
ADD COLUMN "otpLastSentAt" TIMESTAMP(3),
ADD COLUMN "otpVerifyAttempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "checkoutRequestId" TEXT,
ADD COLUMN "marketId" TEXT,
ADD COLUMN "marketCode" TEXT,
ADD COLUMN "marketCountryCode" TEXT;

-- AlterTable
ALTER TABLE "payment_gateways"
ADD COLUMN "secretConfig" TEXT;

-- AlterTable
ALTER TABLE "shipping_rates"
ADD COLUMN "shippingZoneId" TEXT;

-- Backfill zone-specific shipping rates while preserving legacy null-zone fallback.
INSERT INTO "shipping_rates" (
    "id",
    "shippingMethodId",
    "shippingZoneId",
    "type",
    "price",
    "minOrderAmount",
    "maxOrderAmount",
    "priority",
    "isActive",
    "createdAt"
)
SELECT
    concat('rate_', md5(random()::text || clock_timestamp()::text || sr."id" || mz."B")),
    sr."shippingMethodId",
    mz."B",
    sr."type",
    sr."price",
    sr."minOrderAmount",
    sr."maxOrderAmount",
    sr."priority",
    sr."isActive",
    sr."createdAt"
FROM "shipping_rates" sr
JOIN "_MethodZones" mz ON mz."A" = sr."shippingMethodId"
WHERE sr."shippingZoneId" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_tokenHash_key" ON "admin_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "admin_sessions_userId_expiresAt_idx" ON "admin_sessions"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_buckets_key_key" ON "rate_limit_buckets"("key");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_action_identifier_idx" ON "rate_limit_buckets"("action", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "customers_normalizedEmail_key" ON "customers"("normalizedEmail");

-- CreateIndex
CREATE INDEX "customers_normalizedEmail_idx" ON "customers"("normalizedEmail");

-- CreateIndex
CREATE INDEX "addresses_customerId_idx" ON "addresses"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_checkoutRequestId_key" ON "orders"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_createdAt_idx" ON "orders"("paymentStatus", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "shipping_rates_shippingZoneId_shippingMethodId_idx" ON "shipping_rates"("shippingZoneId", "shippingMethodId");

-- CreateIndex
CREATE INDEX "payment_intents_orderId_idx" ON "payment_intents"("orderId");

-- CreateIndex
CREATE INDEX "payment_intents_gatewayRef_idx" ON "payment_intents"("gatewayRef");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_event_logs_provider_eventKey_key" ON "webhook_event_logs"("provider", "eventKey");

-- CreateIndex
CREATE INDEX "webhook_event_logs_orderId_idx" ON "webhook_event_logs"("orderId");

-- CreateIndex
CREATE INDEX "webhook_event_logs_paymentIntentId_idx" ON "webhook_event_logs"("paymentIntentId");

-- CreateIndex
CREATE INDEX "product_reviews_productId_customerId_idx" ON "product_reviews"("productId", "customerId");

-- AddForeignKey
ALTER TABLE "admin_sessions"
ADD CONSTRAINT "admin_sessions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rates"
ADD CONSTRAINT "shipping_rates_shippingZoneId_fkey"
FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
