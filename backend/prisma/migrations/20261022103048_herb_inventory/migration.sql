-- AlterTable
ALTER TABLE "inventory_transactions" ADD COLUMN     "herb_id" TEXT;

-- CreateIndex
CREATE INDEX "inventory_transactions_herb_id_idx" ON "inventory_transactions"("herb_id");

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_herb_id_fkey" FOREIGN KEY ("herb_id") REFERENCES "herbs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
