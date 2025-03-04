/*
  Warnings:

  - You are about to drop the column `type` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "CharterItinerary" ADD COLUMN     "type" "BookingType" NOT NULL DEFAULT 'FullDay';
