import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Extract the boatId from the URL path
    const { pathname } = req.nextUrl;
    const pathSegments = pathname.split("/");
    const boatId = pathSegments[pathSegments.length - 2]; // The second-to-last segment should be the boatId

    const { name, price } = await req.json();

    if (!boatId || !name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        price,
        boats: { connect: { id: boatId } },
      },
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}
