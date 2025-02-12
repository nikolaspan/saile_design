"use client";

import React from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import BookingsTable from "@/components/concierge/BookingsTable";

// ✅ Import JSON files directly from `components/concierge/`
import requestedData from "@/components/concierge/requested.json";
import canceledData from "@/components/concierge/canceled.json";
import tripsData from "@/components/concierge/trips.json";

const role = "Concierge";

// Define the Trip interface
interface Passenger {
  passengerId: string;
  name: string;
  birthId: string;
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

export default function BookingsPage() {
  const currentDate = new Date().toISOString().split("T")[0];

  // ✅ Categorize trips dynamically based on the date
  const completedTrips: Trip[] = tripsData.trips.filter((trip) => trip.date < currentDate);
  const pendingTrips: Trip[] = tripsData.trips.filter((trip) => trip.date >= currentDate);

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <BookingsTable title="Requested Trips" trips={requestedData.requestedTrips} />
          <BookingsTable title="Canceled Trips" trips={canceledData.canceledTrips} />
          <BookingsTable title="Completed & Pending Trips" trips={[...completedTrips, ...pendingTrips]} />
        </div>
      </div>
    </DashboardLayout>
  );
}
