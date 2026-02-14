-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "feeLabel" TEXT,
ADD COLUMN     "feeType" TEXT NOT NULL DEFAULT 'FLAT';
