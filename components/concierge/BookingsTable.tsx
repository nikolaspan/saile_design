"use client";

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

interface Trip {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  roomId: string;
  passengers: Passenger[];
}

interface BookingsTableProps {
  title: string;
  trips: Trip[];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ title, trips }) => {
  const router = useRouter();

  const getTripStatus = (trip: Trip, tableTitle: string) => {
    if (tableTitle === "Canceled Trips")
      return { status: "Canceled", color: "red" };
    if (tableTitle === "Requested Trips")
      return { status: "Requested", color: "yellow" };

    const tripDate = new Date(trip.date);
    const today = new Date();
    return tripDate < today
      ? { status: "Completed", color: "green" }
      : { status: "Pending", color: "blue" };
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
                        key={trip.tripId}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/concierge/bookings/${trip.tripId}`)
                        }
                      >
                        <TableCell>{trip.charterType}</TableCell>
                        <TableCell>{trip.itineraryName}</TableCell>
                        <TableCell>
                          {format(parseISO(trip.date), "yyyy-MM-dd")}
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
                    <TableCell colSpan={4} className="text-center py-4">
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
