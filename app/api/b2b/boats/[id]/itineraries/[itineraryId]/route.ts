import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { itineraryId: string } }) {
  try {
    const { itineraryId } = params;

    if (!itineraryId) {
      return NextResponse.json({ error: "Missing itinerary ID" }, { status: 400 });
    }

    const itinerary = await prisma.itinerary.findUnique({ where: { id: itineraryId } });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json({ message: "Itinerary deleted successfully" }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}
