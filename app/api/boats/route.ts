import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: Request) {
  try {
    // Authenticate the user via NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role?.toLowerCase() !== "concierge" || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Use the authenticated concierge's id
    const conciergeId = session.user.id;

    // Find the concierge and their assigned hotel.
    const concierge = await prisma.concierge.findUnique({
      where: { userId: conciergeId },
      include: { hotel: true },
    });

    if (!concierge || !concierge.hotel) {
      return NextResponse.json({ error: "Concierge or hotel not found" }, { status: 404 });
    }

    // Fetch boats for the concierge's hotel.
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
    console.error("Error fetching boats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
