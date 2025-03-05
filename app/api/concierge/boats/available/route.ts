import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { BookingType, BoatType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dateParam = searchParams.get("date");
  const passengerCountParam = searchParams.get("passengerCount");
  const charterName = searchParams.get("charterName");
  const rawCharterType = searchParams.get("charterType");
  const boatTypeParam = searchParams.get("boatType");
  const conciergeId = searchParams.get("conciergeId");

  if (!dateParam || !charterName || !rawCharterType || !conciergeId) {
    return NextResponse.json(
      { error: "Missing parameters. 'date', 'charterName', 'charterType', and 'conciergeId' are required." },
      { status: 400 }
    );
  }

  const date = parseISO(dateParam);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const charterType = rawCharterType as BookingType;
  const passengerCount = passengerCountParam ? parseInt(passengerCountParam, 10) : 0;
  const start = startOfDay(date);
  const end = endOfDay(date);

  try {
    const boatType = boatTypeParam && boatTypeParam !== "All"
      ? BoatType[boatTypeParam as keyof typeof BoatType]
      : undefined;

    const boatsData = await prisma.boat.findMany({
      where: {
        hotelId: conciergeId, // Ensure boats are filtered by hotelId
        capacity: { gte: passengerCount },
        bookings: {
          none: {
            bookingDateTime: { gte: start, lte: end },
            status: "Definitive",
          },
        },
        unavailability: {
          none: {
            unavailableDate: { gte: start, lte: end },
          },
        },
        charterItineraries: {
          some: {
            name: { equals: charterName, mode: "insensitive" },
            type: { equals: charterType },
          },
        },
        boatType: boatType ? { equals: boatType } : undefined,
      },
    });

    return NextResponse.json({ boats: boatsData });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Error fetching available boats" }, { status: 500 });
  }
}
