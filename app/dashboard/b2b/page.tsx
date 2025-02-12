"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from "@/components/ui/input";

// Import JSON data
import tripsData from "@/components/boats/trips.json";
import boatsData from "@/components/boats/boats.json";

// Define Types
type Trip = {
  id: number;
  boatId: number;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Boat = {
  id: number;
  name: string;
  type: string;
  length: number;
  capacity: number;
};

// Default Sorting Configuration
const defaultSortConfig = { key: "date", direction: "ascending" };

export default function B2BDashboard() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  // Function to get trip status
  const getTripStatus = (date: string) => {
    const tripDate = parseISO(date);
    if (isToday(tripDate)) return { status: "Ongoing", color: "yellow" };
    return tripDate < new Date() ? { status: "Completed", color: "green" } : { status: "Upcoming", color: "blue" };
  };

  // Get today's bookings
  const todaysBookings = tripsData.trips.filter((trip) => isToday(parseISO(trip.date)));

  // Apply filters and sorting
  const filteredTrips = useMemo(() => {
    const filtered = tripsData.trips.filter((trip) => statusFilter === "All" || getTripStatus(trip.date).status === statusFilter);

    return filtered.sort((a, b) => {
      const aValue = sortConfig.key === "date" ? new Date(a.date).getTime() : a[sortConfig.key as keyof Trip];
      const bValue = sortConfig.key === "date" ? new Date(b.date).getTime() : b[sortConfig.key as keyof Trip];

      return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });
  }, [statusFilter, sortConfig]);

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">B2B Dashboard</h1>
          <Button variant="outline">View Reports</Button>
        </div>

        {/* Today's Bookings Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Todays Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysBookings.length > 0 ? (
              <ul className="space-y-2">
                {todaysBookings.map((trip) => (
                  <li key={trip.id} className="flex justify-between">
                    <span>{trip.itineraryName} - {trip.charterType}</span>
                    <span className="font-bold text-green-600">€{trip.revenue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No bookings today.</p>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setStatusFilter("All")}>Reset Filters</Button>
        </div>

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trips Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => setSortConfig({ key: "date", direction: sortConfig.direction === "ascending" ? "descending" : "ascending" })}>
                      Date {sortConfig.key === "date" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead>Charter Type</TableHead>
                    <TableHead>Itinerary</TableHead>
                    <TableHead>Boat</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const { status, color } = getTripStatus(trip.date);
                    const boat = boatsData.boats.find((b) => b.id === trip.boatId);
                    return (
                      <TableRow key={trip.id} className="cursor-pointer hover:bg-gray-100" onClick={() => router.push(`/dashboard/b2b/trips/${trip.id}`)}>
                        <TableCell>{format(parseISO(trip.date), "yyyy-MM-dd")}</TableCell>
                        <TableCell>{trip.charterType}</TableCell>
                        <TableCell>{trip.itineraryName}</TableCell>
                        <TableCell>{boat ? boat.name : "Unknown"}</TableCell>
                        <TableCell>€{trip.revenue}</TableCell>
                        <TableCell><Badge className={`bg-${color}-500 text-white px-3 py-1 rounded-full`}>{status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
