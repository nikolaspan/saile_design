import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the user is authenticated as a concierge.
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      session.user.role?.toLowerCase() !== "concierge"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boatId = params.id;
    if (!boatId) {
      return NextResponse.json({ error: "Boat ID is missing" }, { status: 400 });
    }

    // Retrieve the boat with its itineraries and charter itineraries.
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
      include: {
        itineraries: true,
        charterItineraries: true,
      },
    });

    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }

    return NextResponse.json({ boat }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving boat details:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
