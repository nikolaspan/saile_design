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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ✅ Import JSON directly
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

type SortConfig = {
  key: string;
  direction: "ascending" | "descending";
};

export default function TripsTable() {
  const router = useRouter();
  const trips: Trip[] = tripsData.trips;

  const [charterFilter, setCharterFilter] = useState("All");
  const [itineraryFilter, setItineraryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "ascending",
  });

  const getTripStatus = (date: string): { status: string; color: string } => {
    const tripDate = new Date(date);
    const today = new Date();

    if (tripDate < today) return { status: "Completed", color: "green" };
    if (tripDate.toDateString() === today.toDateString())
      return { status: "Ongoing", color: "yellow" };
    return { status: "Pending", color: "blue" };
  };

  // ✅ Apply filters
  const filteredTrips = trips.filter((trip) => {
    const { status } = getTripStatus(trip.date);
    const charterMatches = charterFilter === "All" || trip.charterType === charterFilter;
    const itineraryMatches = itineraryFilter === "" || trip.itineraryName.toLowerCase().includes(itineraryFilter.toLowerCase());
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

  // ✅ Sorting function
  const sortedTrips = useMemo(() => {
    const sortableTrips = [...filteredTrips];
    if (sortConfig) {
      sortableTrips.sort((a, b) => {
        let aValue: string | Date;
        let bValue: string | Date;
        switch (sortConfig?.key) { // ✅ Optional chaining prevents errors
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
          return sortConfig?.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTrips;
  }, [filteredTrips, sortConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium">Charter Type</span>
              <Select value={charterFilter} onValueChange={setCharterFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Charter Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Full Day">Full Day</SelectItem>
                  <SelectItem value="VIP Transfer">VIP Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium">Itinerary Name</span>
              <Input
                placeholder="Search Itinerary Name"
                className="w-64"
                value={itineraryFilter}
                onChange={(e) => setItineraryFilter(e.target.value)}
              />
            </div>

            <Button variant="outline" onClick={() => {
              setCharterFilter("All");
              setItineraryFilter("");
              setStatusFilter("All");
              setStartDate("");
              setEndDate("");
            }}>
              Reset Filters
            </Button>
          </div>

          <div className="border rounded-lg shadow-md overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => setSortConfig({ key: "charterType", direction: sortConfig?.direction === "ascending" ? "descending" : "ascending" })}>
                      Charter Type
                    </TableHead>
                    <TableHead onClick={() => setSortConfig({ key: "itineraryName", direction: sortConfig?.direction === "ascending" ? "descending" : "ascending" })}>
                      Itinerary Name
                    </TableHead>
                    <TableHead onClick={() => setSortConfig({ key: "date", direction: sortConfig?.direction === "ascending" ? "descending" : "ascending" })}>
                      Date
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTrips.map((trip) => {
                    const { status, color } = getTripStatus(trip.date);
                    return (
                      <TableRow key={trip.tripId} className="cursor-pointer" onClick={() => router.push(`/dashboard/concierge/bookings/${trip.tripId}`)}>
                        <TableCell>{trip.charterType}</TableCell>
                        <TableCell>{trip.itineraryName}</TableCell>
                        <TableCell>{format(parseISO(trip.date), "yyyy-MM-dd")}</TableCell>
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
