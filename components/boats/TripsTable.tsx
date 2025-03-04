"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";

interface Booking {
  id: string;
  bookingDateTime: string;
  charterType: string;
  boat: {
    name: string;
    hotel: {
      name: string;
    };
  };
  charterItinerary: {
    name: string;
    finalPrice: number;
  };
  status: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TripsTable() {
  const router = useRouter();

  // Filter and sort state
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterHotel, setFilterHotel] = useState<string>("");
  const [filterItinerary, setFilterItinerary] = useState<string>("");
  const [filterSingleDate, setFilterSingleDate] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const { data: bookings, error } = useSWR<Booking[]>("/api/b2b/bookings", fetcher);

  // Map bookings to trips, defaulting to an empty array if no data
  const trips = useMemo(() => {
    return bookings
      ? bookings.map((booking) => ({
          ...booking,
          date: booking.bookingDateTime,
        }))
      : [];
  }, [bookings]);

  // Compute status for a booking
  const computeStatus = useCallback((tripDateStr: string, dbStatus: string) => {
    const now = new Date();
    const tripDate = parseISO(tripDateStr);
    const formattedTripDate = format(tripDate, "yyyy-MM-dd");
    const formattedNow = format(now, "yyyy-MM-dd");
    if (formattedTripDate === formattedNow) {
      return "Ongoing";
    }
    if (tripDate.getTime() < now.getTime()) {
      return "Completed";
    }
    return dbStatus;
  }, []);

  // Return Tailwind classes based on status:
  // Completed = green, Definitive = blue, others = orange.
  const getBadgeVariant = (status: string) => {
    if (status === "Completed") return "bg-green-500 text-white";
    if (status === "Definitive") return "bg-blue-500 text-white";
    return "bg-orange-500 text-white";
  };

  // Toggle sorting by Hotel Name
  const handleSortHotel = () => {
    if (sortField === "hotel") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("hotel");
      setSortDirection("asc");
    }
  };

  // Filter and sort trips based on filter/sort states
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = [...trips];

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (trip) => computeStatus(trip.date, trip.status) === filterStatus
      );
    }

    if (filterHotel.trim() !== "") {
      filtered = filtered.filter((trip) =>
        trip.boat.hotel.name.toLowerCase().includes(filterHotel.toLowerCase())
      );
    }

    if (filterItinerary.trim() !== "") {
      filtered = filtered.filter((trip) =>
        trip.charterItinerary.name.toLowerCase().includes(filterItinerary.toLowerCase())
      );
    }

    if (filterSingleDate !== "") {
      filtered = filtered.filter((trip) => {
        const tripDate = format(parseISO(trip.date), "yyyy-MM-dd");
        return tripDate === filterSingleDate;
      });
    } else if (filterStartDate !== "" && filterEndDate !== "") {
      filtered = filtered.filter((trip) => {
        const tripTime = new Date(trip.date).getTime();
        const startTime = new Date(filterStartDate).getTime();
        const endTime = new Date(filterEndDate).getTime();
        return tripTime >= startTime && tripTime <= endTime;
      });
    }

    if (sortField === "hotel") {
      filtered.sort((a, b) => {
        const nameA = a.boat.hotel.name.toLowerCase();
        const nameB = b.boat.hotel.name.toLowerCase();
        if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
        if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    trips,
    filterStatus,
    filterHotel,
    filterItinerary,
    filterSingleDate,
    filterStartDate,
    filterEndDate,
    sortField,
    sortDirection,
    computeStatus,
  ]);

  const handleBookingClick = (booking: Booking) => {
    const encodedData = encodeURIComponent(JSON.stringify(booking));
    router.push(`/dashboard/b2b/bookings/${booking.id}?data=${encodedData}`);
  };

  if (error) return <div>Error loading trips.</div>;
  if (!bookings) return <div>Loading trips...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Charters</h2>

      {/* Filter Options using shadcn components */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
            <SelectTrigger>{filterStatus}</SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Tentative">Tentative</SelectItem>
              <SelectItem value="Definitive">Definitive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Hotel Name Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">Hotel Name</label>
          <Input
            type="text"
            value={filterHotel}
            onChange={(e) => setFilterHotel(e.target.value)}
            placeholder="Filter by hotel"
          />
        </div>
        {/* Itinerary Name Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">Itinerary Name</label>
          <Input
            type="text"
            value={filterItinerary}
            onChange={(e) => setFilterItinerary(e.target.value)}
            placeholder="Search by Itinerary"
          />
        </div>
        {/* Single Date Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">Single Date</label>
          <Input
            type="date"
            value={filterSingleDate}
            onChange={(e) => setFilterSingleDate(e.target.value)}
          />
        </div>
        {/* Date Range Filters */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">Start Date</label>
          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground">End Date</label>
          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="text-left">Charter Itinerary</TableHead>
                <TableHead className="text-left">Boat</TableHead>
                <TableHead className="text-left cursor-pointer" onClick={handleSortHotel}>
                  Hotel Name {sortField === "hotel" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-left">Final Price</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTrips.length > 0 ? (
                filteredAndSortedTrips.map((trip) => {
                  const tripDate = parseISO(trip.date);
                  const computedStatus = computeStatus(trip.date, trip.status);
                  return (
                    <TableRow key={trip.id} className="cursor-pointer" onClick={() => handleBookingClick(trip)}>
                      <TableCell className="text-left">{trip.charterItinerary.name}</TableCell>
                      <TableCell className="text-left">{trip.boat.name}</TableCell>
                      <TableCell className="text-left">{trip.boat.hotel.name}</TableCell>
                      <TableCell className="text-left">€{trip.charterItinerary.finalPrice}</TableCell>
                      <TableCell className="text-left">{format(tripDate, "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-left">
                        <Badge className={getBadgeVariant(computedStatus)}>
                          {computedStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
