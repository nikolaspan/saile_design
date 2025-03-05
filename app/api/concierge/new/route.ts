import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId");

  if (!hotelId) {
    return NextResponse.json(
      { error: "hotelId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch charter itineraries for boats that are connected to the specified hotel.
    const itineraries = await prisma.charterItinerary.findMany({
      where: {
        boat: {
          hotelId: hotelId,
        },
      },
      include: {
        boat: {
          select: {
            name: true,
            hotel: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ itineraries });
  } catch (error) {
    console.error("Error fetching charter itineraries:", error);
    return NextResponse.json(
      { error: "Error fetching charter itineraries" },
      { status: 500 }
    );
  }
}
