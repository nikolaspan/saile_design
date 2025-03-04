import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Define the types for booking and bookings
type Booking = {
  id: string;
  bookingDateTime: Date;
  status: string;
  charterItinerary?: {
    type: string;
    name: string;
    finalPrice: {
      toNumber: () => number;
    };
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Boat = {
  id: string;
  name: string;
  bookings: Booking[];
  itineraries: {
    id: string;
    name: string;
    price: number;
  }[];
  charterItineraries: {
    id: string;
    boatId: string;
    name: string;
    netBoatRentalWithoutCommission: number;
    commission: number;
    netBoatRentalWithoutVAT: number;
    vat: number;
    boatRentalDay: number;
    fuelCost: number;
    priceVATAndFuelIncluded: number;
    ezsailSeaServicesCommission: number;
    finalPrice: number;
    type: string;
  }[];
};

// Helper function to transform bookings
function transformBookings(bookings: Booking[]) {
  return bookings.map((booking) => ({
    id: booking.id,
    date: booking.bookingDateTime.toISOString(),
    charterType: booking.charterItinerary?.type ?? "Unknown",
    status: booking.status,
    itineraryName: booking.charterItinerary?.name ?? "Unknown",
    revenue: booking.charterItinerary?.finalPrice?.toNumber() ?? 0,
  }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise
  const resolvedParams = await params;
  const boatId = resolvedParams.id;

  // Authenticate session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "b2b" || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch boat data, including bookings, itineraries, charter itineraries, and B2B data (including ezsailCommission)
    const boat = await prisma.boat.findUnique({
      where: { id: boatId },
      select: {
        id: true,
        name: true,
        bookings: {
          select: {
            id: true,
            bookingDateTime: true,
            status: true,
            charterItinerary: {
              select: {
                id: true,
                name: true,
                finalPrice: true,
                type: true,
              },
            },
          },
        },
        itineraries: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        charterItineraries: {
          select: {
            id: true,
            boatId: true,
            name: true,
            netBoatRentalWithoutCommission: true,
            commission: true,
            netBoatRentalWithoutVAT: true,
            vat: true,
            boatRentalDay: true,
            fuelCost: true,
            priceVATAndFuelIncluded: true,
            ezsailSeaServicesCommission: true,
            finalPrice: true,
            type: true,
          },
        },
        b2b: {
          select: {
            ezsailCommission: true, // Retrieve ezsailCommission from the B2B user
          },
        },
      },
    });

    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }

    // Use the helper function to transform bookings
    const bookings = transformBookings(boat.bookings);

    // Check if the boat has a valid B2B commission value

    return NextResponse.json(
      {
        id: boat.id,
        name: boat.name,
        bookings,
        itineraries: boat.itineraries,
        charterItineraries: boat.charterItineraries,
        ezSailCommission: boat.b2b?.ezsailCommission
  ? boat.b2b.ezsailCommission.toNumber()
  : NaN,

      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching boat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: boatId } = params;

  // Authenticate session
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "b2b") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the boat by its ID
    const deletedBoat = await prisma.boat.delete({
      where: { id: boatId },
    });
    return NextResponse.json(deletedBoat, { status: 200 });
  } catch (error) {
    console.error("Error deleting boat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}