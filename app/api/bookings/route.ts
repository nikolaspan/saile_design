import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure prisma is correctly initialized

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conciergeId = url.searchParams.get("conciergeId");

  if (!conciergeId) {
    return NextResponse.json(
      { error: "Concierge ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the concierge by userId to get associated hotel
    const concierge = await prisma.concierge.findUnique({
      where: { userId: conciergeId },
      include: {
        hotel: true, // Include hotel data
      },
    });

    if (!concierge) {
      return NextResponse.json(
        { error: "Concierge not found" },
        { status: 404 }
      );
    }

    // Fetch all bookings associated with the concierge's hotel through the concierge relation
    const bookings = await prisma.booking.findMany({
        where: {
          conciergeId: concierge.userId, // Correct filter for the concierge
        },
        include: {
          boat: true, // Include the boat data
          charterItinerary: true, // Include the charterItinerary data
          passengers: true,
          bookingItineraries: true,
        },
      });
      
      

    // Ensure bookings is an array and not null or undefined
    if (!Array.isArray(bookings)) {
      throw new Error("Bookings data is not in the expected format.");
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error("Error fetching bookings:", error);

    // Return a proper object in the error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching bookings. Please try again." },
      { status: 500 }
    );
  }
}
