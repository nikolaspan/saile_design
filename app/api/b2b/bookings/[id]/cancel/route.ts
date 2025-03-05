import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import path as needed

export async function POST(request: Request) {
  try {
    // Extract the bookingId from the URL path
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.split("/");
    const bookingId = pathSegments[pathSegments.length - 2]; // The second-to-last segment should be the bookingId

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
