import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { boatId: string } }
) {
  const { boatId } = params;
  try {
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
      select: { itineraries: true },
    });
    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }
    return NextResponse.json({ itineraries: boat.itineraries });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json({ error: "Error fetching itineraries" }, { status: 500 });
  }
}
