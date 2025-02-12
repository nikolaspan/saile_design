"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trips, getTripStatus } from "@/components/boats/data"; // Adjust this path as needed

export default function BookingsPage() {
  const router = useRouter();

  return (
    <DashboardLayout role="B2B">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Bookings</h1>
          {/* You can add additional actions here */}
          <Button variant="outline" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Charter Type</TableHead>
                <TableHead>Itinerary</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => {
                const { status, color } = getTripStatus(trip.date);
                return (
                  <TableRow
                    key={trip.id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      router.push(`/dashboard/b2b/bookings/${trip.id}`)
                    }
                  >
                    <TableCell>{format(parseISO(trip.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell>{trip.charterType}</TableCell>
                    <TableCell>{trip.itineraryName}</TableCell>
                    <TableCell>€{trip.revenue}</TableCell>
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
    </DashboardLayout>
  );
}
