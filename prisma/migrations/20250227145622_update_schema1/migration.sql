/*
  Warnings:

  - You are about to drop the column `bookingDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[boatId,bookingDateTime]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `b2bId` on table `Boat` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bookingDateTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `conciergeId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nationality` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('FullDay', 'HalfDay', 'VipTransfer', 'SunsetCruise');

-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('concierge', 'admin', 'b2b');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'Pending';
ALTER TYPE "BookingStatus" ADD VALUE 'WaitingApproval';
ALTER TYPE "BookingStatus" ADD VALUE 'Cancelled';

-- DropForeignKey
ALTER TABLE "Boat" DROP CONSTRAINT "Boat_b2bId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_conciergeId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropIndex
DROP INDEX "Booking_boatId_bookingDate_key";

-- AlterTable
ALTER TABLE "Boat" ALTER COLUMN "b2bId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bookingDate",
ADD COLUMN     "bookingDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "BookingType" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Tentative',
ALTER COLUMN "conciergeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "nationality" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoleType" NOT NULL DEFAULT 'b2b';

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "UserRole";

-- CreateTable
CREATE TABLE "UserPerk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UserPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPerkAssignment" (
    "userId" TEXT NOT NULL,
    "perkId" TEXT NOT NULL,

    CONSTRAINT "UserPerkAssignment_pkey" PRIMARY KEY ("userId","perkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPerk_name_key" ON "UserPerk"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_boatId_bookingDateTime_key" ON "Booking"("boatId", "bookingDateTime");

-- AddForeignKey
ALTER TABLE "UserPerkAssignment" ADD CONSTRAINT "UserPerkAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPerkAssignment" ADD CONSTRAINT "UserPerkAssignment_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "UserPerk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_conciergeId_fkey" FOREIGN KEY ("conciergeId") REFERENCES "Concierge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
