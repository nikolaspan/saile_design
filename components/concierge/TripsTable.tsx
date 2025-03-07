/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo } from "react";
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
import { format, parseISO, isWithinInterval } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


import tripsData from "./trips.json";

// Updated Trip type to match our JSON structure
type Trip = {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  boatId: number; 
  passengers: {
    passengerId: string;
    name: string;
    birthday: string; 
  }[];
};

type SortConfig = {
  key: string;
  direction: "ascending" | "descending";
};

export default function TripsTable() {
  const router = useRouter();
  const trips: Trip[] = tripsData.trips;

  // Filter states

  const [charterFilter, setCharterFilter] = useState("All");
  const [itineraryFilter, setItineraryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "ascending",
  });

  // Determine trip status based on date
  const getTripStatus = (date: string): { status: string; color: string } => {
    const tripDate = new Date(date);
    const today = new Date();

    if (tripDate < today) return { status: "Completed", color: "green" };
    if (tripDate.toDateString() === today.toDateString())
      return { status: "Ongoing", color: "yellow" };
    return { status: "Pending", color: "blue" };
  };

  // Apply filters to trips
  const filteredTrips = trips.filter((trip) => {
    const { status } = getTripStatus(trip.date);
    const charterMatches =
      charterFilter === "All" || trip.charterType === charterFilter;
    const itineraryMatches =
      itineraryFilter === "" ||
      trip.itineraryName.toLowerCase().includes(itineraryFilter.toLowerCase());
    const statusMatches = statusFilter === "All" || status === statusFilter;

    const tripDate = parseISO(trip.date);
    let dateMatches = true;
    if (startDate && endDate) {
      dateMatches = isWithinInterval(tripDate, {
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
    } else if (startDate) {
      dateMatches = format(tripDate, "yyyy-MM-dd") === startDate;
    } else if (endDate) {
      dateMatches = format(tripDate, "yyyy-MM-dd") === endDate;
    }

    return charterMatches && itineraryMatches && statusMatches && dateMatches;
  });

  // Apply sorting
  const sortedTrips = useMemo(() => {
    const sortableTrips = [...filteredTrips];
    if (sortConfig) {
      sortableTrips.sort((a, b) => {
        let aValue: string | Date;
        let bValue: string | Date;
        switch (sortConfig.key) {
          case "charterType":
            aValue = a.charterType.toLowerCase();
            bValue = b.charterType.toLowerCase();
            break;
          case "itineraryName":
            aValue = a.itineraryName.toLowerCase();
            bValue = b.itineraryName.toLowerCase();
            break;
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "status":
            aValue = getTripStatus(a.date).status.toLowerCase();
            bValue = getTripStatus(b.date).status.toLowerCase();
            break;
          default:
            aValue = "";
            bValue = "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTrips;
  }, [filteredTrips, sortConfig]);

  // Helper function to render sort indicator
  const renderSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Section */}
          <div className="border rounded-lg shadow-md overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() =>
                        setSortConfig({
                          key: "charterType",
                          direction:
                            sortConfig.key === "charterType"
                              ? sortConfig.direction === "ascending"
                                ? "descending"
                                : "ascending"
                              : "ascending",
                        })
                      }
                    >
                      Charter Type{renderSortIndicator("charterType")}
                    </TableHead>
                    <TableHead
                      onClick={() =>
                        setSortConfig({
                          key: "itineraryName",
                          direction:
                            sortConfig.key === "itineraryName"
                              ? sortConfig.direction === "ascending"
                                ? "descending"
                                : "ascending"
                              : "ascending",
                        })
                      }
                    >
                      Itinerary Name{renderSortIndicator("itineraryName")}
                    </TableHead>
                    <TableHead
                      onClick={() =>
                        setSortConfig({
                          key: "date",
                          direction:
                            sortConfig.key === "date"
                              ? sortConfig.direction === "ascending"
                                ? "descending"
                                : "ascending"
                              : "ascending",
                        })
                      }
                    >
                      Date{renderSortIndicator("date")}
                    </TableHead>
                    <TableHead
                      onClick={() =>
                        setSortConfig({
                          key: "status",
                          direction:
                            sortConfig.key === "status"
                              ? sortConfig.direction === "ascending"
                                ? "descending"
                                : "ascending"
                              : "ascending",
                        })
                      }
                    >
                      Status{renderSortIndicator("status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTrips.map((trip) => {
                    const { status, color } = getTripStatus(trip.date);
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
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
