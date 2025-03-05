import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

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
    console.log(`Deleting bookings for boat ${boatId}`);
    await prisma.booking.deleteMany({ where: { boatId } });

    // Delete related unavailability records
    console.log(`Deleting unavailability for boat ${boatId}`);
    await prisma.boatUnavailability.deleteMany({ where: { boatId } });

    // Delete related charter itineraries
    console.log(`Deleting charter itineraries for boat ${boatId}`);
    await prisma.charterItinerary.deleteMany({ where: { boatId } });

    // Delete the boat record
    console.log(`Deleting boat ${boatId}`);
    const deletedBoat = await prisma.boat.delete({
      where: { id: boatId },
    });

    console.log("Boat successfully deleted:", deletedBoat);
    return NextResponse.json(deletedBoat, { status: 200 });
  } catch (error) {
    console.error("Error deleting boat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
