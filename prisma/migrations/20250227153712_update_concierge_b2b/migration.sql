/*
  Warnings:

  - The primary key for the `B2B` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `B2B` table. All the data in the column will be lost.
  - The primary key for the `Concierge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Concierge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "B2BHotel" DROP CONSTRAINT "B2BHotel_b2bId_fkey";

-- DropForeignKey
ALTER TABLE "Boat" DROP CONSTRAINT "Boat_b2bId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_b2bId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_conciergeId_fkey";

-- DropIndex
DROP INDEX "B2B_userId_key";

-- DropIndex
DROP INDEX "Concierge_userId_key";

-- AlterTable
ALTER TABLE "B2B" DROP CONSTRAINT "B2B_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "B2B_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "Concierge" DROP CONSTRAINT "Concierge_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Concierge_pkey" PRIMARY KEY ("userId");

-- AddForeignKey
ALTER TABLE "B2BHotel" ADD CONSTRAINT "B2BHotel_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_conciergeId_fkey" FOREIGN KEY ("conciergeId") REFERENCES "Concierge"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
