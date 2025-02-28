/*
  Warnings:

  - A unique constraint covering the columns `[b2bId,name]` on the table `Boat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Boat_b2bId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Boat_b2bId_name_key" ON "Boat"("b2bId", "name");
