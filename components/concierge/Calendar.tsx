import * as React from "react";
import { useState } from "react";
import { format, parseISO, isValid, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"; // Calendar component import

type Booking = {
  id: string;
  boatName: string;
  bookingDateTime: string;
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
  bookingType?: string; // Include the charter type here
};

interface CalendarProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export default function Calendar({ bookings, loading, error }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 3; // Show 3 bookings per page

  // Safely parse booking dates and ignore invalid ones
  const bookedDates = bookings
    .map((booking) => {
      if (booking.bookingDateTime) {
        const parsedDate = parseISO(booking.bookingDateTime); // Use bookingDateTime here
        return isValid(parsedDate) ? parsedDate : null; // Only include valid dates
      }
      return null; // If bookingDateTime is undefined or null, return null
    })
    .filter((date) => date !== null); // Remove null values

  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // Filter trips for the selected date
  const tripsForDate = bookings.filter((booking) => {
    const bookingFormatted = format(parseISO(booking.bookingDateTime), "yyyy-MM-dd"); // Use bookingDateTime
    return bookingFormatted === formattedDate;
  });

  // Calculate the number of pages
  const totalPages = Math.ceil(tripsForDate.length / bookingsPerPage);

  // Get the bookings for the current page
  const currentBookings = tripsForDate.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
      {/* Left Card (Calendar) */}
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
            <div>
              <h3>{`Total Trips for ${formattedDate}: ${tripsForDate.length}`}</h3>

              {/* Calendar component */}
              <ShadcnCalendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  tripDays: (date) =>
                    bookedDates.some((bookedDate) => isValid(bookedDate) && isSameDay(bookedDate, date)),
                }}
                modifiersClassNames={{
                  tripDays: "bg-blue-500 text-white rounded-full",
                  selected: "bg-blue-500 dark:bg-blue-400 text-white font-bold",
                }}
                className="w-full h-[450px] max-w-[600px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Card (Trip Details) */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            tripsForDate.length > 0 ? (
              <div>
                {/* Displaying the trips for the selected date */}
                {currentBookings.map((trip) => {
                  const bookingDate = trip.bookingDateTime
                    ? parseISO(trip.bookingDateTime)
                    : null;
                  const dateDisplay = bookingDate
                    ? format(bookingDate, "MMM dd, yyyy")
                    : "No Date";
                  const timeDisplay = bookingDate
                    ? format(bookingDate, "hh:mm a")
                    : "No Time";

                  return (
                    <div key={trip.id} className="p-4 border rounded-lg shadow mb-4">
                      <h3 className="text-lg font-semibold">
                        Boat: {trip.boatName}
                      </h3>
                      <p className="text-sm ">
                        <strong>Date:</strong> {dateDisplay}
                      </p>
                      <p className="text-sm ">
                        <strong>Time:</strong> {timeDisplay}
                      </p>

                      {/* Booking Type below time */}
                      {trip.bookingType && (
                        <p className="text-sm  mt-2">
                          <strong>Booking Type:</strong> {trip.bookingType}
                        </p>
                      )}

                      <p className="text-sm  mt-2">
                        <strong>Status:</strong> {trip.status}
                      </p>
                      <p className="text-sm  mt-2">
                        <strong>Room:</strong> {trip.roomNumber || "N/A"}
                      </p>
                      {trip.charterItinerary && (
                        <p className="text-sm  mt-2">
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
                        <Button size="sm" className="mt-3">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  );
                })}
                {/* Pagination */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
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
