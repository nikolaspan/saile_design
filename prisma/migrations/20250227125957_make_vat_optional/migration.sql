-- AlterTable
ALTER TABLE "B2B" ADD COLUMN     "vat" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "conciergeId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_conciergeId_fkey" FOREIGN KEY ("conciergeId") REFERENCES "Concierge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
