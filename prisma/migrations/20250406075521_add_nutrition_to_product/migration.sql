-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "nutrition" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceType" TEXT NOT NULL DEFAULT 'unidad',
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'kg';
