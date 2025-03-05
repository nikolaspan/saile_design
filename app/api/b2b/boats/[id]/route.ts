import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// GET handler for fetching boat information
export async function GET(request: Request) {
  try {
    // Extract the boatId from the URL path
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.split("/");
    const boatId = pathSegments[pathSegments.length - 2]; // The second-to-last segment should be the boatId

    // Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "b2b") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch boat data from the database
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
      include: {
        bookings: true,
        itineraries: true,
        charterItineraries: true,
      },
    });

    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }

    // Return the boat data
    return NextResponse.json(boat, { status: 200 });
  } catch (error) {
    console.error("Error fetching boat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE handler for deleting a boat
export async function DELETE(request: Request) {
  try {
    // Extract the boatId from the URL path
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.split("/");
    const boatId = pathSegments[pathSegments.length - 2]; // The second-to-last segment should be the boatId

    // Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "b2b") {
      console.error("Unauthorized deletion attempt for boat:", boatId);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete related bookings (if any exist)
    await prisma.booking.deleteMany({ where: { boatId } });

    // Delete related unavailability records
    await prisma.boatUnavailability.deleteMany({ where: { boatId } });

    // Delete related charter itineraries
    await prisma.charterItinerary.deleteMany({ where: { boatId } });

    // Now, delete the boat record
    const deletedBoat = await prisma.boat.delete({
      where: { id: boatId },
    });

    return NextResponse.json(deletedBoat, { status: 200 });
  } catch (error) {
    console.error("Error deleting boat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
