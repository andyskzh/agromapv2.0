-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "baseProductId" TEXT;

-- CreateTable
CREATE TABLE "ProductBase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL DEFAULT 'OTRO',
    "nutrition" TEXT NOT NULL,

    CONSTRAINT "ProductBase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_baseProductId_fkey" FOREIGN KEY ("baseProductId") REFERENCES "ProductBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
