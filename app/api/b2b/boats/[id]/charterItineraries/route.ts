import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BookingType } from "@prisma/client"; // Import the enum

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boatId } = await params;

  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    session.user.role !== "b2b" ||
    !session.user.id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    charterType,
    itineraryName,
    rentalPriceWithoutCommission,
    commission,
    fuelCost,
  } = body;

  if (
    !charterType ||
    !itineraryName ||
    rentalPriceWithoutCommission == null ||
    commission == null ||
    fuelCost == null
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const boat = await prisma.boat.findUnique({
    where: { id: boatId },
    select: {
      b2b: {
        select: { ezsailCommission: true },
      },
    },
  });

  if (!boat) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  const ezsailCommissionPercentage = boat.b2b?.ezsailCommission
    ? Number(boat.b2b.ezsailCommission)
    : 0;

  const netBoatRentalWithoutCommissionVal = Number(rentalPriceWithoutCommission);
  const commissionVal = Number(commission);
  const fuelCostVal = Number(fuelCost);

  if (
    isNaN(netBoatRentalWithoutCommissionVal) ||
    isNaN(commissionVal) ||
    isNaN(fuelCostVal)
  ) {
    return NextResponse.json(
      { error: "Invalid number input" },
      { status: 400 }
    );
  }

  const netBoatRentalWithoutVATVal = netBoatRentalWithoutCommissionVal + commissionVal;
  const vatVal = netBoatRentalWithoutVATVal * 0.24;
  const boatRentalDayVal = netBoatRentalWithoutVATVal + vatVal;
  const priceVATAndFuelIncludedVal = boatRentalDayVal + fuelCostVal;
  const ezsailSeaServicesCommissionVal = netBoatRentalWithoutVATVal * (ezsailCommissionPercentage / 100);
  const finalPriceVal = priceVATAndFuelIncludedVal + ezsailSeaServicesCommissionVal;

  const typeEnum = charterType.replace(/\s+/g, "");
  const bookingType = typeEnum as BookingType;

  try {
    const newCharterItinerary = await prisma.charterItinerary.create({
      data: {
        boat: { connect: { id: boatId } },
        name: itineraryName,
        type: bookingType,
        netBoatRentalWithoutCommission: netBoatRentalWithoutCommissionVal,
        commission: commissionVal,
        netBoatRentalWithoutVAT: netBoatRentalWithoutVATVal,
        vat: vatVal,
        boatRentalDay: boatRentalDayVal,
        fuelCost: fuelCostVal,
        priceVATAndFuelIncluded: priceVATAndFuelIncludedVal,
        ezsailSeaServicesCommission: ezsailSeaServicesCommissionVal,
        finalPrice: finalPriceVal,
      },
    });

    return NextResponse.json(newCharterItinerary, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating charter itinerary:", error); // Log more details
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
