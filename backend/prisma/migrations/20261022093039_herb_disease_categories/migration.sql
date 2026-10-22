/*
  Warnings:

  - Added the required column `mime_type` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "disease_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disease_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "herb_disease_categories" (
    "id" TEXT NOT NULL,
    "herb_id" TEXT NOT NULL,
    "disease_category_id" TEXT NOT NULL,

    CONSTRAINT "herb_disease_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disease_categories_name_key" ON "disease_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "herb_disease_categories_herb_id_disease_category_id_key" ON "herb_disease_categories"("herb_id", "disease_category_id");

-- AddForeignKey
ALTER TABLE "herb_disease_categories" ADD CONSTRAINT "herb_disease_categories_herb_id_fkey" FOREIGN KEY ("herb_id") REFERENCES "herbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "herb_disease_categories" ADD CONSTRAINT "herb_disease_categories_disease_category_id_fkey" FOREIGN KEY ("disease_category_id") REFERENCES "disease_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
