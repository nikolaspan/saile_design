/*
  Warnings:

  - The values [NotDefinitive] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `vat` on table `B2B` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('Definitive', 'Tentative');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'Definitive';
COMMIT;

-- AlterTable
ALTER TABLE "B2B" ALTER COLUMN "vat" SET NOT NULL;
