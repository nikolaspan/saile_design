import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId");
  const query = searchParams.get("query") || "";

  if (!hotelId) {
    return NextResponse.json(
      { error: "hotelId query parameter is required" },
      { status: 400 }
    );
  }

  console.log("Hotel ID:", hotelId);  // Log hotelId
  console.log("Query:", query);  // Log the query term

  try {
    // Fetch charter itineraries for boats connected to the specified hotel,
    // where the itinerary name contains the query string (case-insensitive)
    const itineraries = await prisma.charterItinerary.findMany({
      where: {
        boat: {
          hotelId: hotelId,  // Ensure the correct hotel ID is used
        },
        name: {
          contains: query,
          mode: "insensitive", // Case insensitive
        },
      },
      take: 10, // limit suggestions
    });

    console.log("Itineraries Found:", itineraries);  // Log found itineraries

    return NextResponse.json({ itineraries });
  } catch (error) {
    console.error("Error fetching charter itineraries:", error);
    return NextResponse.json(
      { error: "Error fetching charter itineraries" },
      { status: 500 }
    );
  }
}
