import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conciergeId = searchParams.get("conciergeId");

    if (!conciergeId) {
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    // Fetch bookings for the specified concierge.
    const bookings = await prisma.booking.findMany({
      where: { conciergeId },
      include: {
        boat: true,
        charterItinerary: true,
        bookingItineraries: { include: { itinerary: true } },
        passengers: true,
      },
      orderBy: { bookingDateTime: "desc" },
    });

    // Map the results into a simplified structure that includes a "type" field.
    const mappedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDateTime.toISOString(),
      // Add the "type" property, using charterItinerary.type if available, otherwise "N/A"
      type: booking.charterItinerary?.type ?? "N/A",
      status: booking.status,
      roomNumber: booking.roomNumber || "N/A",
      boatName: booking.boat?.name || "Unknown Boat",
      charterItinerary: booking.charterItinerary
        ? {
            id: booking.charterItinerary.id,
            name: booking.charterItinerary.name,
          }
        : null,
      itineraries: booking.bookingItineraries.map((bi) => ({
        id: bi.itinerary.id,
        name: bi.itinerary.name,
        price: Number(bi.itinerary.price),
      })),
      passengersCount: booking.passengers.length,
    }));

    const response = NextResponse.json({ bookings: mappedBookings }, { status: 200 });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
    return response;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}
