/*
  Warnings:

  - A unique constraint covering the columns `[name,type,boatId]` on the table `CharterItinerary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CharterItinerary_name_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "CharterItinerary_name_type_boatId_key" ON "CharterItinerary"("name", "type", "boatId");
