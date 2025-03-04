// app/api/b2b/bookings/[id]/cancel/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import path as needed

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  // Await the context before destructuring params
  const { params } = await Promise.resolve(context);
  const bookingId = params.id;

  try {
    // Update the booking status to "Cancelled"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "Cancelled" },
    });

    return NextResponse.json(
      { message: "Booking cancelled successfully", booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
