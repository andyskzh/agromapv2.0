/*
  Warnings:

  - Added the required column `marketId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "marketId" TEXT NOT NULL,
ADD COLUMN     "recommends" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
