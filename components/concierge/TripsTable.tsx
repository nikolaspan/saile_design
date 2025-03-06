"use client";
import React, { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"; // Import Shadcn Select
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the Booking type that matches our API response.
export type Booking = {
  id: string;
  boatName: string;
  bookingDateTime: string;
  type: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary?: { id: string; name: string; type: string } | null; // Added 'type' in the booking type
  itineraries?: { id: string; name: string; price: number }[];
  passengersCount: number;
};

interface TripsTableProps {
  bookings: Booking[];
  loading: boolean;
}

type SortConfig = {
  key: keyof Booking;
  direction: "ascending" | "descending";
};

export default function TripsTable({ bookings, loading }: TripsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "bookingDateTime", // Default sorting by date
    direction: "ascending",
  });

  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Apply date filtering logic if start date or end date is provided
    if (filterStartDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = parseISO(booking.bookingDateTime);
        const startDate = parseISO(filterStartDate);
        return bookingDate >= startDate;
      });
    }

    if (filterEndDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = parseISO(booking.bookingDateTime);
        const endDate = parseISO(filterEndDate);
        return bookingDate <= endDate;
      });
    }

    return filtered;
  }, [bookings, filterStartDate, filterEndDate]);

  const sortedBookings = useMemo(() => {
    const sortable = [...filteredBookings];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aValue =
          sortConfig.key === "bookingDateTime"
            ? new Date(a.bookingDateTime)
            : (a[sortConfig.key] as string).toLowerCase();
        const bValue =
          sortConfig.key === "bookingDateTime"
            ? new Date(b.bookingDateTime)
            : (b[sortConfig.key] as string).toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredBookings, sortConfig]);

  const renderSortIndicator = (key: keyof Booking) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  const handleSort = (key: keyof Booking) => {
    const newDirection =
      sortConfig && sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    setSortConfig({ key, direction: newDirection });
  };

  const getStatusBadge = (status: string, bookingDateTime: string) => {
    let badgeColor = "blue";
    let displayStatus = status;

    if (status.toLowerCase() === "definitive" && new Date(bookingDateTime) < new Date()) {
      displayStatus = "Completed";
      badgeColor = "green";
    } else if (status.toLowerCase() === "tentative") {
      badgeColor = "orange";
    } else if (status.toLowerCase() === "cancelled") {
      badgeColor = "red";
    }

    return { displayStatus, badgeColor };
  };

  if (loading) return <p>Loading trips...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trips</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Sort and Filter Options */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Select value={sortConfig.key} onValueChange={(value) => handleSort(value as keyof Booking)}>
            <SelectTrigger>
              <div className="inline-flex items-center justify-between rounded-md">
                <span>Sort By: {sortConfig.key}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boatName">Boat Name</SelectItem>
              <SelectItem value="bookingDateTime">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <label htmlFor="start-date">Start Date:</label>
            <Input
              id="start-date"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date">End Date:</label>
            <Input
              id="end-date"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button variant="outline" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}>
            Reset Filters
          </Button>
        </div>

        <div className="border rounded-lg shadow-md overflow-hidden max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("boatName")}>
                  Boat Name{renderSortIndicator("boatName")}
                </TableHead>
                <TableHead onClick={() => handleSort("bookingDateTime")}>
                  Date{renderSortIndicator("bookingDateTime")}
                </TableHead>
                <TableHead onClick={() => handleSort("bookingDateTime")}>
                  Time{renderSortIndicator("bookingDateTime")}
                </TableHead>
                <TableHead onClick={() => handleSort("type")}>
                  Type{renderSortIndicator("type")}
                </TableHead>
                <TableHead onClick={() => handleSort("status")}>
                  Status{renderSortIndicator("status")}
                </TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Charter Itinerary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking, index) => {
                  const bookingDate = booking.bookingDateTime ? parseISO(booking.bookingDateTime) : null;
                  const dateDisplay = bookingDate ? format(bookingDate, "yyyy-MM-dd") : "No Date";
                  const timeDisplay = bookingDate ? format(bookingDate, "hh:mm a") : "No Time";

                  const { displayStatus, badgeColor } = getStatusBadge(booking.status, booking.bookingDateTime);

                  return (
                    <TableRow
                      key={`${booking.id}-${index}`}
                      className="cursor-pointer"
                    >
                      <TableCell>{booking.boatName || "N/A"}</TableCell>
                      <TableCell>{dateDisplay}</TableCell>
                      <TableCell>{timeDisplay}</TableCell>
                      <TableCell>{booking.type}</TableCell>
                      <TableCell>
                        <Badge className={`bg-${badgeColor}-500 text-white px-3 py-1 rounded-full`}>
                          {displayStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.roomNumber || "N/A"}</TableCell>
                      <TableCell>{booking.charterItinerary?.name || "N/A"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>No trips available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
