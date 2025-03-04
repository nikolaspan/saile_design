import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const boatId = params.id;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}
