import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

function transformCharterType(type: string): string {
  switch (type) {
    case "FullDay":
      return "Full Day";
    case "HalfDay":
      return "Half Day";
    case "VipTransfer":
      return "VIP Transfer";
    case "SunsetCruise":
      return "Sunset Cruise";
    default:
      return type;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "b2b" || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        boat: {
          b2bId: session.user.id,
        },
      },
      select: {
        bookingDateTime: true,
        status: true,
        boat: { select: { name: true } },
        charterItinerary: {
          select: {
            name: true,
            type: true,
            netBoatRentalWithoutCommission: true,
            commission: true,
            netBoatRentalWithoutVAT: true,
            vat: true,
            boatRentalDay: true,
            fuelCost: true,
            priceVATAndFuelIncluded: true,
            ezsailSeaServicesCommission: true,
            finalPrice: true,
          },
        },
        concierge: {
          select: { user: { select: { name: true } } },
        },
        passengers: { select: { id: true } },
        bookingItineraries: {
          select: {
            itinerary: { select: { name: true, price: true } },
          },
        },
      },
      orderBy: { bookingDateTime: "desc" },
    });

    const analyticsData = bookings.map((booking) => {
      const itinerary = booking.charterItinerary;
      return {
        date: booking.bookingDateTime.toISOString(),
        passengerCount: booking.passengers.length,
        confirmedBy: booking.concierge ? booking.concierge.user.name : "Unknown",
        itinerary: booking.bookingItineraries.map((bi) => bi.itinerary.name).join(", "),
        status: booking.status,
        comments: new Date(booking.bookingDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        boatName: booking.boat.name,
        charterName: itinerary ? itinerary.name : "Unknown",
        charterType: itinerary ? transformCharterType(itinerary.type) : "Unknown",
        netBoatRentalWithoutCommission: itinerary ? Number(itinerary.netBoatRentalWithoutCommission).toFixed(2) : "0.00",
        commission: itinerary ? Number(itinerary.commission).toFixed(2) : "0.00",
        netBoatRentalWithoutVAT: itinerary ? Number(itinerary.netBoatRentalWithoutVAT).toFixed(2) : "0.00",
        vat24: itinerary ? Number(itinerary.vat).toFixed(2) : "0.00",
        boatRentalDay: itinerary ? Number(itinerary.boatRentalDay).toFixed(2) : "0.00",
        fuelCost: itinerary ? Number(itinerary.fuelCost).toFixed(2) : "0.00",
        priceVATAndFuelIncluded: itinerary ? Number(itinerary.priceVATAndFuelIncluded).toFixed(2) : "0.00",
        ezSailSeaServicesCommission: itinerary ? Number(itinerary.ezsailSeaServicesCommission).toFixed(2) : "0.00",
        finalPrice: itinerary ? Number(itinerary.finalPrice).toFixed(2) : "0.00",
      };
    });

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
