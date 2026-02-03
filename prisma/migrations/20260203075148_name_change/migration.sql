/*
  Warnings:

  - You are about to drop the column `firstName` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullname" TEXT;
