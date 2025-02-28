-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Definitive', 'NotDefinitive');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concierge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,

    CONSTRAINT "Concierge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2B" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ezsailCommission" DECIMAL(65,30) NOT NULL DEFAULT 3.00,

    CONSTRAINT "B2B_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2BHotel" (
    "b2bId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,

    CONSTRAINT "B2BHotel_pkey" PRIMARY KEY ("b2bId","hotelId")
);

-- CreateTable
CREATE TABLE "Boat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "b2bId" TEXT,
    "hotelId" TEXT NOT NULL,
    "isForeign" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skipper" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "licenseNumber" TEXT NOT NULL,

    CONSTRAINT "Skipper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoatUnavailability" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "unavailableDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Unavailable',

    CONSTRAINT "BoatUnavailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "b2bId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'Definitive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "idNumber" TEXT NOT NULL,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "Concierge_userId_key" ON "Concierge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "B2B_userId_key" ON "B2B"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Boat_b2bId_key" ON "Boat"("b2bId");

-- CreateIndex
CREATE UNIQUE INDEX "Skipper_boatId_key" ON "Skipper"("boatId");

-- CreateIndex
CREATE UNIQUE INDEX "Skipper_licenseNumber_key" ON "Skipper"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BoatUnavailability_boatId_unavailableDate_key" ON "BoatUnavailability"("boatId", "unavailableDate");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_boatId_bookingDate_key" ON "Booking"("boatId", "bookingDate");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concierge" ADD CONSTRAINT "Concierge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concierge" ADD CONSTRAINT "Concierge_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2B" ADD CONSTRAINT "B2B_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2BHotel" ADD CONSTRAINT "B2BHotel_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2BHotel" ADD CONSTRAINT "B2BHotel_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skipper" ADD CONSTRAINT "Skipper_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoatUnavailability" ADD CONSTRAINT "BoatUnavailability_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_b2bId_fkey" FOREIGN KEY ("b2bId") REFERENCES "B2B"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
