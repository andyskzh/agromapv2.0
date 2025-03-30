-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('FRUTA', 'HORTALIZA', 'VIANDA', 'CARNE_EMBUTIDO', 'OTRO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'OTRO';
