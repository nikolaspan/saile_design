import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conciergeId = searchParams.get("conciergeId");

    if (!conciergeId) {
      return NextResponse.json({ error: "Concierge ID is required" }, { status: 400 });
    }

    // Find the concierge and their assigned hotel
    const concierge = await prisma.concierge.findUnique({
      where: { userId: conciergeId },
      include: { hotel: true },
    });

    if (!concierge || !concierge.hotel) {
      return NextResponse.json({ error: "Concierge or hotel not found" }, { status: 404 });
    }

    // Fetch boats for the concierge's hotel
    const boats = await prisma.boat.findMany({
      where: { hotelId: concierge.hotelId },
      include: {
        b2b: true,
        hotel: true,
      },
    });

    if (boats.length === 0) {
      return NextResponse.json({ error: "No boats found for this hotel" }, { status: 404 });
    }

    return NextResponse.json({ boats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
