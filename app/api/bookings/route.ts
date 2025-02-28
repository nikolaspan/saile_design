import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conciergeId = searchParams.get("conciergeId");

    if (!conciergeId) {
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    // Fetch bookings for the given concierge, including necessary related data.
    const bookings = await prisma.booking.findMany({
      where: { conciergeId },
      include: {
        boat: true,
        charterItinerary: true,
        bookingItineraries: {
          include: { itinerary: true },
        },
      },
    });

    // Map results to a simplified structure.
    const mappedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDateTime.toISOString(),
      type: booking.type,
      status: booking.status,
      roomNumber: booking.roomNumber || "N/A",
      boatName: booking.boat?.name || "Unknown Boat",
      charterItinerary: booking.charterItinerary
        ? {
            id: booking.charterItinerary.id,
            name: booking.charterItinerary.name,
            netBoatRentalWithoutCommission: booking.charterItinerary.netBoatRentalWithoutCommission,
            commission: booking.charterItinerary.commission,
            netBoatRentalWithoutVAT: booking.charterItinerary.netBoatRentalWithoutVAT,
            vat: booking.charterItinerary.vat,
            boatRentalDay: booking.charterItinerary.boatRentalDay,
            fuelCost: booking.charterItinerary.fuelCost,
            priceVATAndFuelIncluded: booking.charterItinerary.priceVATAndFuelIncluded,
            ezsailSeaServicesCommission: booking.charterItinerary.ezsailSeaServicesCommission,
            finalPrice: booking.charterItinerary.finalPrice,
          }
        : null,
      itineraries: booking.bookingItineraries.map((bi) => ({
        id: bi.itinerary.id,
        name: bi.itinerary.name,
        price: bi.itinerary.price,
      })),
    }));

    // Set caching headers to allow edge/CDN caching.
    const response = NextResponse.json({ bookings: mappedBookings }, { status: 200 });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
    return response;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ bookings: [] }, { status: 200 });
  }
}
