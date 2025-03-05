import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // Retrieve the session on the server.
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Look up the concierge record for the logged-in user.
  const concierge = await prisma.concierge.findUnique({
    where: { userId: session.user.id },
    select: { hotelId: true },
  });

  if (!concierge) {
    return NextResponse.json({ error: "Concierge not found" }, { status: 404 });
  }

  return NextResponse.json({ hotelId: concierge.hotelId });
}
