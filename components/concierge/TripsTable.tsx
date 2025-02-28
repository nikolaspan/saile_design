"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Booking = {
  id: string;
  boatName: string;
  bookingDate: string;
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
};

interface TripsTableProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

type SortConfig = {
  key: keyof Booking;
  direction: "ascending" | "descending";
};

export default function TripsTable({ bookings, loading, error }: TripsTableProps) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "bookingDate",
    direction: "ascending",
  });

  // Filtering states
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const sortedBookings = useMemo(() => {
    const sortable = [...bookings];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aValue =
          sortConfig.key === "bookingDate"
            ? new Date(a.bookingDate)
            : (a[sortConfig.key] as string).toLowerCase();
        const bValue =
          sortConfig.key === "bookingDate"
            ? new Date(b.bookingDate)
            : (b[sortConfig.key] as string).toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [bookings, sortConfig]);

  const filteredBookings = useMemo(() => {
    return sortedBookings.filter((booking) => {
      if (filterType !== "All" && booking.type !== filterType) return false;
      if (filterStartDate && filterEndDate) {
        const bookingDate = new Date(booking.bookingDate);
        const start = new Date(filterStartDate);
        const end = new Date(filterEndDate);
        if (bookingDate < start || bookingDate > end) return false;
      } else if (filterStartDate) {
        const bookingStr = format(new Date(booking.bookingDate), "yyyy-MM-dd");
        if (bookingStr !== filterStartDate) return false;
      }
      return true;
    });
  }, [sortedBookings, filterType, filterStartDate, filterEndDate]);

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

  const resetFilters = () => {
    setFilterType("All");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  if (loading) return <p>Loading trips...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trips</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Type: {filterType} ▼</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["All", "FullDay", "HalfDay", "VipTransfer", "SunsetCruise"].map((type) => (
                <DropdownMenuItem key={type} onSelect={() => setFilterType(type)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>

        <div className="border rounded-lg shadow-md overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("boatName")}>
                    Boat Name{renderSortIndicator("boatName")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("bookingDate")}>
                    Date{renderSortIndicator("bookingDate")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("bookingDate")}>
                    Time{renderSortIndicator("bookingDate")}
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
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, index) => {
                    const bookingDate = booking.bookingDate ? parseISO(booking.bookingDate) : null;
                    const dateDisplay = bookingDate ? format(bookingDate, "yyyy-MM-dd") : "No Date";
                    const timeDisplay = bookingDate ? format(bookingDate, "hh:mm a") : "No Time";

                    let displayStatus = booking.status;
                    let badgeColor = "blue";
                    if (
                      booking.status.toLowerCase() === "definitive" ||
                      booking.status.toLowerCase() === "tentative"
                    ) {
                      if (bookingDate) {
                        if (bookingDate < new Date()) {
                          displayStatus = "Completed";
                          badgeColor = "green";
                        } else if (format(bookingDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) {
                          displayStatus = "Ongoing";
                          badgeColor = "yellow";
                        }
                      }
                    }

                    return (
                      <TableRow
                        key={`${booking.id}-${index}`}
                        className="cursor-pointer"
                        onClick={() =>
                          // Pass booking data via query string (encode it) to avoid re-fetching.
                          router.push(
                            `/dashboard/concierge/bookings/${booking.id}?data=${encodeURIComponent(
                              JSON.stringify(booking)
                            )}`
                          )
                        }
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
                        <TableCell>
                          {booking.charterItinerary ? booking.charterItinerary.name : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  // If no bookings match, render an empty TableBody (i.e. no rows).
                  <></>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
