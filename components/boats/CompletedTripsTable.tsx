import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export type Trip = {
  id: string;
  date: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  status?: string; 
};

interface CompletedTripsTableProps {
  trips: Trip[];
  onBookingCancelled?: () => Promise<void>;
}

// Returns "Completed" if the trip date is in the past; otherwise, returns the booking status.
function getDisplayStatus(trip: Trip): string {
  const tripDate = new Date(trip.date);
  if (tripDate < new Date()) {
    return "Completed";
  }
  return trip.status ?? "Unknown";
}

type SortField = "charterType" | "itineraryName" | "revenue" | "date" | "status";

export default function CompletedTripsTable({ trips, onBookingCancelled }: CompletedTripsTableProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Sorting state: sortField and sortDirection
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for cancellation dialog and loading
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [tripToCancel, setTripToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const filteredTrips = trips.filter((trip) => {
    if (statusFilter !== "All" && getDisplayStatus(trip) !== statusFilter) {
      return false;
    }
    const tripDateFormatted = format(new Date(trip.date), "yyyy-MM-dd");
    if (fromDate && toDate) {
      return tripDateFormatted >= fromDate && tripDateFormatted <= toDate;
    } else if (fromDate || toDate) {
      const filterDate = fromDate || toDate;
      return tripDateFormatted >= filterDate;
    }
    return true;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    let comparison = 0;
    if (sortField === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "revenue") {
      comparison = a.revenue - b.revenue;
    } else if (sortField === "charterType") {
      comparison = a.charterType.localeCompare(b.charterType);
    } else if (sortField === "itineraryName") {
      comparison = a.itineraryName.localeCompare(b.itineraryName);
    } else if (sortField === "status") {
      comparison = getDisplayStatus(a).localeCompare(getDisplayStatus(b));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 opacity-50" size={16} />;
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-1" size={16} /> : <ArrowDown className="ml-1" size={16} />;
  };

  const handleCancelBooking = async (tripId: string) => {
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/b2b/bookings/${tripId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to cancel booking");
      }
      const data = await res.json();
      console.log(`Booking ${tripId} cancelled successfully:`, data);
      // Call the refresh callback if provided.
      if (onBookingCancelled) {
        await onBookingCancelled();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setSortField("date");
    setSortDirection("asc");
  };

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Tentative">Tentative</SelectItem>
            <SelectItem value="Definitive">Definitive</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From"
          className="w-[160px]"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="To (optional)"
          className="w-[160px]"
        />

        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("charterType")} className="cursor-pointer">
              <div className="flex items-center">
                Charter Type {renderSortIcon("charterType")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("itineraryName")} className="cursor-pointer">
              <div className="flex items-center">
                Itinerary Name {renderSortIcon("itineraryName")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("revenue")} className="cursor-pointer">
              <div className="flex items-center">
                Revenue (€) {renderSortIcon("revenue")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
              <div className="flex items-center">
                Date {renderSortIcon("date")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
              <div className="flex items-center">
                Status {renderSortIcon("status")}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center">Actions</div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrips.map((trip) => {
            const displayStatus = getDisplayStatus(trip);
            const color =
              displayStatus === "Completed"
                ? "green"
                : displayStatus === "Tentative"
                ? "yellow"
                : displayStatus === "Definitive"
                ? "blue"
                : displayStatus === "Pending"
                ? "orange"
                : displayStatus === "Cancelled"
                ? "red"
                : "gray";
            return (
              <TableRow key={trip.id}>
                <TableCell>{trip.charterType}</TableCell>
                <TableCell>{trip.itineraryName}</TableCell>
                <TableCell>€{trip.revenue.toFixed(2)}</TableCell>
                <TableCell>{format(new Date(trip.date), "yyyy-MM-dd")}</TableCell>
                <TableCell>
                  <Badge className={`bg-${color}-500 text-white`}>{displayStatus}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={
                      displayStatus === "Cancelled" ||
                      displayStatus === "Completed" ||
                      isCancelling
                    }
                    onClick={() => {
                      setTripToCancel(trip.id);
                      setCancelDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-1" size={16} /> Cancel
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelling}
              onClick={async () => {
                if (tripToCancel) {
                  await handleCancelBooking(tripToCancel);
                }
                setCancelDialogOpen(false);
              }}
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
