"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Passenger {
  passengerId: string;
  name: string;
  birthday: string;
}

interface Booking {
  id: string;
  bookingDateTime: string;
  charterType: string;
  charterItinerary: {
    name: string;
  };
  boat: {
    name: string;
  };
  passengers: Passenger[];
}

interface TodaysBookingsProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export default function TodaysBookings({ bookings = [], onBookingClick }: TodaysBookingsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Today&apos;s Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <ul className="space-y-2">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex justify-between cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onBookingClick(booking)}
              >
                <span>
                  {booking.charterItinerary.name} - {booking.charterType} - Boat: {booking.boat.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No bookings today.</p>
        )}
      </CardContent>
    </Card>
  );
}
