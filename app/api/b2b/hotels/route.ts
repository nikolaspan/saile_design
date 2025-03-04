/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Retrieve all B2BHotel records, including the related hotel and its boats.
    // This returns every hotel connected via B2BHotel—even if a hotel has no boats.
    const b2bHotels = await prisma.b2BHotel.findMany({
      include: {
        hotel: {
          include: {
            boats: true, // boats will be an empty array if none exist.
          },
        },
      },
    });

    // Extract the hotel data from the B2BHotel relation.
    const hotels = b2bHotels.map((b2bHotel) => b2bHotel.hotel);

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
