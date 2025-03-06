import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Passenger {
  passengerId: string;
  name: string;
  birthday: string;
}

interface CharterItinerary {
  type: string;
  name: string;
}

interface Trip {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  boatName: string;
  roomId: string;
  boatId: number;
  passengers: Passenger[];
  status: string; // Add status directly here
  charterItinerary?: CharterItinerary;
}

interface BookingsTableProps {
  title: string;
  trips: Trip[];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ title, trips }) => {
  const router = useRouter();

  const getTripStatus = (trip: Trip, tableTitle: string) => {
    // Ensure the status is correctly mapped
    if (tableTitle === "Canceled Trips") {
      return { status: "Canceled", color: "red" };
    }
    if (tableTitle === "Requested Trips") {
      return { status: "Requested", color: "yellow" };
    }

    // Check if it's a Tentative booking by checking the trip's status
    const tripStatus = trip.status; // Directly use the status from the trip

    // If the status is Tentative, show Tentative, otherwise check other statuses
    if (tripStatus === "Tentative") {
      return { status: "Tentative", color: "orange" };
    }

    const tripDate = new Date(trip.date);
    const today = new Date();

    return tripDate < today
      ? { status: "Completed", color: "green" }
      : { status: "Definitive", color: "blue" };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg shadow-md overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boat Name</TableHead>
                  <TableHead>Charter Type</TableHead>
                  <TableHead>Itinerary Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.length > 0 ? (
                  trips.map((trip) => {
                    const { status, color } = getTripStatus(trip, title);
                    return (
                      <TableRow
                        key={`${trip.tripId}-${trip.roomId}`} // Ensure unique key using a combination of tripId and roomId
                        className="cursor-pointer "
                        onClick={() =>
                          router.push(
                            `/dashboard/concierge/bookings/${trip.tripId}?data=${encodeURIComponent(
                              JSON.stringify(trip)
                            )}`
                          )
                        }
                      >
                        <TableCell>{trip.boatName || "Unknown Boat"}</TableCell>
                        <TableCell>
                          {trip.charterItinerary?.type || trip.charterType || "N/A"}
                        </TableCell>
                        <TableCell>{trip.itineraryName || "N/A"}</TableCell>
                        <TableCell>
                          {trip.date ? format(parseISO(trip.date), "yyyy-MM-dd") : "Invalid date"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`bg-${color}-500 text-white px-3 py-1 rounded-full`}>
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No results found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsTable;
