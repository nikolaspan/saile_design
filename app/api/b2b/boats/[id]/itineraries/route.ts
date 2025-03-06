
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id, name, price } = await request.json();

    // Log incoming request data for debugging
    console.log("Incoming data:", { id, name, price });

    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: "Missing required fields: id, name, and price" }, { status: 400 });
    }

    const boat = await prisma.boat.findUnique({
      where: { id },
    });

    if (!boat) {
      return NextResponse.json({ error: `Boat with ID ${id} not found` }, { status: 404 });
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        price,
        boats: {
          connect: {
            id, 
          },
        },
      },
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}
