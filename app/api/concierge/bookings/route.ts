
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Assuming you have auth options set up for next-auth

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "concierge") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const conciergeId = session.user.id;

  try {
    // Retrieve bookings for the authenticated concierge
    const bookings = await prisma.booking.findMany({
      where: {
        conciergeId: conciergeId, // Filter by the logged-in concierge
      },
      include: {
        boat: true,               // Ensure that the boat is included
        charterItinerary: true,   // Include the charter itinerary details
        passengers: true,         // Include passengers in the booking
        bookingItineraries: true, // Include the itinerary details
        
      },
    });

    // Map the data to include the boatName and bookingType for easier access
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      boatName: booking.boat.name, // Extract boat name
      bookingType: booking.charterItinerary?.type, // Extract booking type from charter itinerary
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error fetching bookings" },
      { status: 500 }
    );
  }
}
