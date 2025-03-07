import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

interface PassengerInfo {
  fullName: string;
  idNumber: string;
  birth: Date | null;
  nationality: string;
}

interface ItineraryOption {
  id: string;
  name: string;
  price: number;
}

interface BookingData {
  passengers: PassengerInfo[];
  itineraries: ItineraryOption[];
  hour: string;
  bookingType: "Definitive" | "Tentative";
  roomNumber: string;
  boatId: string;
  charterItineraryId: string;
  conciergeId: string;
  b2bId: string;
}

export async function POST(request: Request) {
  try {
    const data: BookingData = await request.json();  // Type assertion for data

    const { passengers, itineraries, hour, bookingType, roomNumber, boatId, charterItineraryId, conciergeId, b2bId } = data;

    // Validate incoming data
    if (!boatId || !charterItineraryId || !conciergeId || !b2bId || !roomNumber || !passengers || !hour || !bookingType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        boat: { connect: { id: boatId } },
        bookingDateTime: new Date(`${new Date().toISOString().split('T')[0]}T${hour}`),  // Combine date and hour
        status: BookingStatus[bookingType as keyof typeof BookingStatus],  // Use enum for status
        roomNumber,
        charterItinerary: { connect: { id: charterItineraryId } },
        concierge: { connect: { userId: conciergeId } },
        b2b: { connect: { userId: b2bId } },  // Connect the b2bId (boat owner)
        requiresApproval: false,
        passengers: {
          create: passengers.map((passenger) => ({
            fullName: passenger.fullName,
            idNumber: passenger.idNumber,
            dateOfBirth: passenger.birth,
            nationality: passenger.nationality,
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
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Error creating booking" }, { status: 500 });
  }
}
