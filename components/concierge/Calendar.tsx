"use client";

import * as React from "react";
import { format, parseISO, isSameDay } from "date-fns";
import Link from "next/link";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import JSON data
import tripsData from "./trips.json";

type Trip = {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  roomId: string;
  passengers: {
    passengerId: string;
    name: string;
    birthId: string;
  }[];
};

const trips: Trip[] = tripsData.trips;

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );

  const bookedDates = trips.map((trip) => parseISO(trip.date));
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const tripsForDate = trips.filter((trip) => trip.date === formattedDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
      {/* Calendar Section */}
      <Card className="w-full max-w-[750px]">
        <CardHeader>
          <CardTitle>Trips Calendar</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Trip Details Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            tripsForDate.length > 0 ? (
              <ul className="space-y-4">
                {tripsForDate.map((trip) => (
                  <li
                    key={trip.tripId}
                    className="p-4 border rounded-lg bg-white dark:bg-gray-700 shadow"
                  >
                    <h3 className="text-lg font-semibold">
                      {trip.itineraryName}
                    </h3>
                    <p className="text-sm">
                      <strong>Charter Type:</strong> {trip.charterType}
                    </p>
                    <p className="text-sm">
                      <strong>Revenue:</strong> €{trip.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong>{" "}
                      {format(parseISO(trip.date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm">
                      <strong>Passengers:</strong> {trip.passengers.length}
                    </p>
                    <Link href={`/dashboard/concierge/bookings/${trip.tripId}`}>
                      <Button size="sm" className="mt-3">
                        View Details
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center">
                <p>No trips on this date.</p>
                <Link href="/dashboard/concierge/bookings/new">
                  <Button variant="secondary" className="mt-4 px-4 py-2">
                    Book Now
                  </Button>
                </Link>
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
