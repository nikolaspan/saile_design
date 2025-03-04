import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // Retrieve the current session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "b2b" || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch bookings safely
    const bookings = await prisma.booking.findMany({
      where: { b2bId: session.user.id },
      include: {
        boat: { include: { hotel: true } },
        concierge: true,
        charterItinerary: true,
        bookingItineraries: { include: { itinerary: true } },
        passengers: true,
      },
    });

    console.log("API Response:", bookings); // Debugging log

    return NextResponse.json(bookings ?? [], { status: 200 }); // Always return an array
  } catch (error: unknown) {
    console.error("Error retrieving bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
