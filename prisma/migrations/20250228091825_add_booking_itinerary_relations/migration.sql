/*
  Warnings:

  - Added the required column `charterItineraryId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "charterItineraryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CharterItinerary" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "netBoatRentalWithoutCommission" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "netBoatRentalWithoutVAT" DECIMAL(10,2) NOT NULL,
    "vat" DECIMAL(10,2) NOT NULL,
    "boatRentalDay" DECIMAL(10,2) NOT NULL,
    "fuelCost" DECIMAL(10,2) NOT NULL,
    "priceVATAndFuelIncluded" DECIMAL(10,2) NOT NULL,
    "ezsailSeaServicesCommission" DECIMAL(10,2) NOT NULL,
    "finalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CharterItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItinerary" (
    "bookingId" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,

    CONSTRAINT "BookingItinerary_pkey" PRIMARY KEY ("bookingId","itineraryId")
);

-- CreateTable
CREATE TABLE "_BoatItineraries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BoatItineraries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BoatItineraries_B_index" ON "_BoatItineraries"("B");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_charterItineraryId_fkey" FOREIGN KEY ("charterItineraryId") REFERENCES "CharterItinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharterItinerary" ADD CONSTRAINT "CharterItinerary_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItinerary" ADD CONSTRAINT "BookingItinerary_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItinerary" ADD CONSTRAINT "BookingItinerary_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoatItineraries" ADD CONSTRAINT "_BoatItineraries_A_fkey" FOREIGN KEY ("A") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoatItineraries" ADD CONSTRAINT "_BoatItineraries_B_fkey" FOREIGN KEY ("B") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
