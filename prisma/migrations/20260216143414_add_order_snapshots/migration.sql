-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "billingAddress" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "shippingAddress" JSONB NOT NULL DEFAULT '{}';
