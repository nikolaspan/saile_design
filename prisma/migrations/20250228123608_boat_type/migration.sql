-- CreateEnum
CREATE TYPE "BoatType" AS ENUM ('Catamaran', 'RIB', 'Speedboat', 'Yacht', 'Monohull');

-- AlterTable
ALTER TABLE "Boat" ADD COLUMN     "boatType" "BoatType" NOT NULL DEFAULT 'Monohull';
