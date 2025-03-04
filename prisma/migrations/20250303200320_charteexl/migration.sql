/*
  Warnings:

  - A unique constraint covering the columns `[name,type]` on the table `CharterItinerary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CharterItinerary_name_type_key" ON "CharterItinerary"("name", "type");
