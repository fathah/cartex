-- Add taxRate and taxMode columns to settings table
ALTER TABLE "settings" ADD COLUMN "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 5;
ALTER TABLE "settings" ADD COLUMN "taxMode" TEXT NOT NULL DEFAULT 'EXCLUSIVE';
