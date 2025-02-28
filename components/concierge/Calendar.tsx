"use client";

import * as React from "react";
import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import Link from "next/link";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  boatName: string;
  bookingDate: string;
  type: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary?: {
    id: string;
    name: string;
  } | null;
  itineraries?: {
    id: string;
    name: string;
    price: number;
  }[];
};

interface CalendarProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export default function Calendar({ bookings, loading, error }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const bookedDates = bookings.map((booking) => parseISO(booking.bookingDate));
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const tripsForDate = bookings.filter((booking) => {
    const bookingFormatted = format(parseISO(booking.bookingDate), "yyyy-MM-dd");
    return bookingFormatted === formattedDate;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
      <Card className="w-full max-w-[750px]">
        <CardHeader>
          <CardTitle>Trips Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading bookings...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ShadcnCalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                tripDays: (date) =>
                  bookedDates.some((bookedDate) => isSameDay(bookedDate, date)),
              }}
              modifiersClassNames={{
                tripDays: "bg-blue-500 text-white rounded-full",
                selected: "bg-blue-500 dark:bg-blue-400 text-white font-bold",
              }}
              className="w-full h-[450px] max-w-[600px]"
            />
          )}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            tripsForDate.length > 0 ? (
              <ul className="space-y-4">
                {tripsForDate.map((trip) => {
                  const bookingDate = trip.bookingDate
                    ? parseISO(trip.bookingDate)
                    : null;
                  const dateDisplay = bookingDate
                    ? format(bookingDate, "MMM dd, yyyy")
                    : "No Date";
                  const timeDisplay = bookingDate
                    ? format(bookingDate, "hh:mm a")
                    : "No Time";

                  return (
                    <li key={trip.id} className="p-4 border rounded-lg shadow">
                      <h3 className="text-lg font-semibold">
                        Boat: {trip.boatName}
                      </h3>
                      <p className="text-sm">
                        <strong>Date:</strong> {dateDisplay}
                      </p>
                      <p className="text-sm">
                        <strong>Time:</strong> {timeDisplay}
                      </p>
                      <p className="text-sm">
                        <strong>Type:</strong> {trip.type}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> {trip.status}
                      </p>
                      <p className="text-sm">
                        <strong>Room:</strong> {trip.roomNumber || "N/A"}
                      </p>
                      {trip.charterItinerary && (
                        <p className="text-sm mt-2">
                          <strong>Charter Itinerary:</strong>{" "}
                          {trip.charterItinerary.name}
                        </p>
                      )}
                      {trip.itineraries && trip.itineraries.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold">Itineraries:</p>
                          <ul className="list-disc list-inside">
                            {trip.itineraries.map((itinerary) => (
                              <li key={itinerary.id} className="text-sm">
                                {itinerary.name} - ${itinerary.price}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link
                        href={`/dashboard/concierge/bookings/${trip.id}?data=${encodeURIComponent(
                          JSON.stringify(trip)
                        )}`}
                      >
                        <Button size="sm" className="mt-3">Learn More</Button>
                      </Link>

                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center">
                <p>No trips on this date.</p>
              </div>
            )
          ) : (
            <p className="text-sm text-center">
              Please select a date to view bookings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
