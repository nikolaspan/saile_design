import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BoatType } from "@prisma/client"; // Import Prisma Enum

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boatTypeRaw = searchParams.get("boatType");
  const minCapacity = parseInt(searchParams.get("minCapacity") || "0", 10);

  // Ensure `boatTypeRaw` is a valid enum value
  const boatType =
    boatTypeRaw && Object.values(BoatType).includes(boatTypeRaw as BoatType)
      ? (boatTypeRaw as BoatType)
      : undefined;

  // Get session and check authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "b2b") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all boats without pagination
    const boats = await prisma.boat.findMany({
      where: {
        b2bId: session.user.id,
        boatType,
        capacity: { gte: minCapacity },
      },
      include: { hotel: true },
    });

    return NextResponse.json({ boats, total: boats.length });
  } catch (error) {
    console.error("Error fetching boats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "b2b") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hotelId, name, boatType, capacity, length } = await request.json();

    // Validate the boatType against the Prisma enum
    if (!Object.values(BoatType).includes(boatType)) {
      return NextResponse.json({ error: "Invalid boat type" }, { status: 400 });
    }

    // Create new boat entry and include the hotel in the returned object.
    const newBoat = await prisma.boat.create({
      data: {
        b2bId: session.user.id,
        hotelId,
        name,
        boatType,
        capacity,
        length,
      },
      include: { hotel: true },
    });

    return NextResponse.json(newBoat, { status: 201 });
  } catch (error) {
    console.error("Error adding boat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
