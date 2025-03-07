// app/api/bookings/[id]/route.ts
import { prisma } from "@/lib/prisma"; // Ensure Prisma is set up correctly
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: id,
      },
      include: {
        boat: true,
        charterItinerary: true,
        passengers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
