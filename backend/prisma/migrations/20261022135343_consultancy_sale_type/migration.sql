-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('PRODUCT', 'CONSULTANCY');

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "sale_type" "SaleType" NOT NULL DEFAULT 'PRODUCT';
