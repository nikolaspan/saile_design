
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Assuming you have auth options set up for next-auth
import { BookingStatus } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "concierge") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const conciergeId = session.user.id;

  try {
    // Retrieve bookings for the authenticated concierge
    const bookings = await prisma.booking.findMany({
      where: {
        conciergeId: conciergeId, // Filter by the logged-in concierge
      },
      include: {
        boat: true,               // Ensure that the boat is included
        charterItinerary: true,   // Include the charter itinerary details
        passengers: true,         // Include passengers in the booking
        bookingItineraries: true, // Include the itinerary details
        
      },
    });

    // Map the data to include the boatName and bookingType for easier access
    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      boatName: booking.boat.name, // Extract boat name
      bookingType: booking.charterItinerary?.type, // Extract booking type from charter itinerary
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error fetching bookings" },
      { status: 500 }
    );
  }
}
interface BookingData {
  passengers: PassengerInfo[];
  itineraries: ItineraryOption[];
  hour: string;
  bookingType: 'Definitive' | 'Tentative';
  roomNumber: string;
  boatId: string;
  charterItineraryId: string;
  conciergeId: string;
  b2bId: string;
}

interface PassengerInfo {
  fullName: string;
  idNumber: string;
  birth: Date | null;
  nationality: string;  // Add nationality here
}


interface ItineraryOption {
  id: string;
  name: string;
  price: number;
}

export async function POST(request: Request) {
  try {
    const data: BookingData = await request.json();

    // Destructure data from request body
    const {
      passengers,
      itineraries,
      hour,
      bookingType,
      roomNumber,
      boatId,
      charterItineraryId,
      conciergeId,
      b2bId
    } = data;

    // Validate incoming data
    if (!boatId || !charterItineraryId || !conciergeId || !b2bId || !roomNumber || !passengers || !hour || !bookingType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the Concierge exists
    const concierge = await prisma.concierge.findUnique({
      where: { userId: conciergeId },
    });

    if (!concierge) {
      return NextResponse.json({ error: 'Concierge not found' }, { status: 404 });
    }

    // Create the booking
    const newBooking = await prisma.booking.create({
      data: {
        boat: { connect: { id: boatId } },
        bookingDateTime: new Date(`${new Date().toISOString().split('T')[0]}T${hour}`), // Combine date and hour
        status: bookingType === 'Definitive' ? BookingStatus.Definitive : BookingStatus.Tentative, // Use enum for status
        roomNumber,
        charterItinerary: { connect: { id: charterItineraryId } },
        concierge: { connect: { userId: conciergeId } }, // Now it ensures that the Concierge exists
        b2b: { connect: { userId: b2bId } },
        requiresApproval: false,
        passengers: {
          create: passengers.map((passenger) => ({
            fullName: passenger.fullName,
            idNumber: passenger.idNumber,
            dateOfBirth: passenger.birth,
            nationality: passenger.nationality,  // Include nationality field
          })),
        },
        bookingItineraries: {
          create: itineraries.map((itinerary) => ({
            itineraryId: itinerary.id,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, bookingId: newBooking.id }, { status: 201 });

  } catch (error) {
    // Ensure error is an object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating booking:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

