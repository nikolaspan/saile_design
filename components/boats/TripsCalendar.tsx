/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Trip Type
export type Trip = {
  id: string;
  date: string; // ISO format (2025-03-15T12:52:04.530Z)
  charterType?: string;
  itineraryName?: string;
  revenue?: number;
  status?: string;
};

export interface TripsCalendarProps {
  trips: Trip[];
}

export default function TripsCalendar({ trips }: TripsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();

  // Debug: Log trips received
  useEffect(() => {
   
  }, [trips]);

  // Find trips on the selected date using isSameDay to compare dates
  const selectedTrips = trips.filter((trip) => {
    if (!trip.date) {
      console.error("Invalid trip date:", trip.date); // Log if date is undefined
      return false; // Skip invalid dates
    }
  
    try {
      const tripDate = parseISO(trip.date);
      return selectedDate ? isSameDay(tripDate, selectedDate) : false;
    } catch (error) {
      console.error("Error in date matching:", trip.date); // Handle invalid date format
      return false;
    }
  });
  
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Calendar Section */}
      <Card className="w-full md:w-1/3">
        <CardHeader>
          <CardTitle>Trips Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              booked: (date) =>
                trips.some((trip) => {
                  try {
                    const tripDate = parseISO(trip.date);
                    return isSameDay(tripDate, date);
                  } catch (error) {
                    console.error("Error in date matching:", trip.date);
                    return false;
                  }
                }),
            }}
            modifiersClassNames={{
              booked: "bg-blue-400 text-white rounded-full",
              selected: "bg-blue-600 text-white font-bold",
            }}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Trip Details Section */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTrips.length > 0 ? (
            <ScrollArea className="h-64">
              <ul className="space-y-3">
                {selectedTrips.map((trip) => (
                  <li
                    key={trip.id}
                    className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow"
                  >
                    <p className="font-medium">
                      <strong>Charter Type:</strong> {trip.charterType || "N/A"}
                    </p>
                    <p>
                      <strong>Itinerary:</strong> {trip.itineraryName || "N/A"}
                    </p>
                    <p>
                      <strong>Revenue:</strong> €{trip.revenue?.toFixed(2) || "0.00"}
                    </p>
                    <p>
                      <strong>Date:</strong> {format(parseISO(trip.date), "yyyy-MM-dd")}
                    </p>
                    <p>
                      <strong>Status:</strong> {trip.status || "N/A"}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {trip.charterType}
                    </Badge>
                    <Button
                      variant="default"
                      className="mt-2 w-full"
                      onClick={() => router.push(`/dashboard/b2b/bookings/${encodeURIComponent(trip.id)}`)}
                    >
                      Learn More
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {selectedDate ? "No trips found for this date." : "Select a date to see trip details."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
