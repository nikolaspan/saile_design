import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BookingType } from "@prisma/client"; // Import the enum

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the dynamic route params
  const { id: boatId } = await params;

  // Authenticate session
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    session.user.role !== "b2b" ||
    !session.user.id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Extract required fields from the body
  const {
    charterType,
    itineraryName,
    rentalPriceWithoutCommission, // Net Boat Rental without Commission
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

  // Fetch the boat with its associated B2B commission info
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

  // Get the EzSail commission percentage (default to 0 if not set)
  const ezsailCommissionPercentage = boat.b2b?.ezsailCommission
    ? Number(boat.b2b.ezsailCommission)
    : 0;

  // Convert inputs to numbers
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

  // Calculate values based on your formula:
  // 1) netBoatRentalWithoutVAT = (Net Boat Rental without Commission) + Commission
  const netBoatRentalWithoutVATVal = netBoatRentalWithoutCommissionVal + commissionVal;
  // 2) VAT = netBoatRentalWithoutVATVal * 0.24
  const vatVal = netBoatRentalWithoutVATVal * 0.24;
  // 3) Boat Rental/Day = netBoatRentalWithoutVATVal + vatVal
  const boatRentalDayVal = netBoatRentalWithoutVATVal + vatVal;
  // 4) Price VAT & Fuel Included = boatRentalDayVal + fuelCostVal
  const priceVATAndFuelIncludedVal = boatRentalDayVal + fuelCostVal;
  // 5) EzSail Sea Services Commission = netBoatRentalWithoutVATVal * (ezsailCommissionPercentage / 100)
  const ezsailSeaServicesCommissionVal = netBoatRentalWithoutVATVal * (ezsailCommissionPercentage / 100);
  // 6) Final Price = Price VAT & Fuel Included + EzSail Sea Services Commission
  const finalPriceVal = priceVATAndFuelIncludedVal + ezsailSeaServicesCommissionVal;

  // Transform the provided charterType (e.g., "Half Day") to match the BookingType enum (e.g., "HalfDay")
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
    console.error("Error creating charter itinerary:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      // Unique constraint violation on [name, type]
      return NextResponse.json(
        { error: "A charter itinerary with this name and charter type already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
