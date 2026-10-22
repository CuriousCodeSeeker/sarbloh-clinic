-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_medicine_id_fkey";

-- DropIndex
DROP INDEX "inventory_transactions_created_at_idx";

-- DropIndex
DROP INDEX "inventory_transactions_transaction_type_idx";

-- AlterTable
ALTER TABLE "inventory_transactions" ALTER COLUMN "medicine_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
