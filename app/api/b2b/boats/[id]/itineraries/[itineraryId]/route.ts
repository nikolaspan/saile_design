import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// This function will delete an itinerary based on the dynamic URL parameters [id] and [itineraryId]
export async function DELETE(req: NextRequest) {
  try {
    // Extracting parameters from the URL path
    const pathSegments = req.nextUrl.pathname.split("/");
    const itineraryId = pathSegments[pathSegments.length - 1]; // last segment should be the itineraryId

    if (!itineraryId) {
      return NextResponse.json({ error: "Missing itinerary ID" }, { status: 400 });
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json({ message: "Itinerary deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}
