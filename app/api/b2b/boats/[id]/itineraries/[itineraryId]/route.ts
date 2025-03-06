import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; itineraryId: string }> }) {
  try {
    // Resolve the promise to get the actual params
    const resolvedParams = await params;
    const { itineraryId } = resolvedParams;

    if (!itineraryId) {
      return NextResponse.json({ error: "Missing itinerary ID" }, { status: 400 });
    }

    // Find the itinerary from the database
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    // Delete the itinerary
    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json({ message: "Itinerary deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}
