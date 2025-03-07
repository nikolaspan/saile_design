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
  const [selectedTrips, setSelectedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch booking data if no trip is found for the selected date
  const fetchBookingData = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings?date=${date}`);
      const data = await response.json();
      setSelectedTrips(data || []);
    } catch (error) {
      console.error("Error fetching booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter the trips for the selected date
  useEffect(() => {
    if (selectedDate) {
      const filteredTrips = trips.filter((trip) => {
        const tripDate = parseISO(trip.date);
        return isSameDay(tripDate, selectedDate);
      });

      if (filteredTrips.length > 0) {
        setSelectedTrips(filteredTrips);
      } else {
        fetchBookingData(format(selectedDate, "yyyy-MM-dd")); // Fetch data if no trips are found
      }
    }
  }, [selectedDate, trips]);

  // On booking click, pass the data to the booking details page
  const onBookingClick = (trip: Trip) => {
    const encodedData = encodeURIComponent(JSON.stringify(trip)); // Encode the trip data
    router.push(`/dashboard/b2b/bookings/${encodeURIComponent(trip.id)}?data=${encodedData}`); // Navigate to the booking details page with encoded data
  };

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
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          {loading ? (
            <p>Loading...</p>
          ) : selectedTrips.length > 0 ? (
            <ScrollArea className="h-64">
              <ul className="space-y-3">
                {selectedTrips.map((trip) => (
                  <li
                    key={trip.id}
                    className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow"
                    onClick={() => onBookingClick(trip)} // Call onBookingClick when clicking on a trip
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
