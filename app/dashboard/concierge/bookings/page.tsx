"use client";

import React from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import BookingsTable from "@/components/concierge/BookingsTable";

// ✅ Import JSON files
import requestedData from "@/components/concierge/requested.json";
import canceledData from "@/components/concierge/canceled.json";
import tripsData from "@/components/concierge/trips.json";

const role = "Concierge";

// Define the Passenger interface
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
  boatId: number; // ✅ Add this line
  passengers: Passenger[];
}


// Define raw types matching the JSON structure
interface RawPassenger {
  passengerId: string;
  name: string;
  birthId: string;
}

interface RawTrip {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  boatId: number;
  passengers: RawPassenger[];
}

interface RawTripsJson {
  trips: RawTrip[];
}

//  Ensure correct transformation from `birthId` to `birthday`
const unifiedTrips: Trip[] = (tripsData as unknown as RawTripsJson).trips.map((trip: RawTrip) => ({
  tripId: trip.tripId,
  charterType: trip.charterType,
  itineraryName: trip.itineraryName,
  revenue: trip.revenue,
  date: trip.date,
  boatId: trip.boatId, // ✅ Ensure this exists
  roomId: String(trip.boatId), // ❓ Double-check if this mapping is intentional
  passengers: trip.passengers.map((p: RawPassenger) => ({
    passengerId: p.passengerId,
    name: p.name,
    birthday: p.birthId, 
  })) as Passenger[],
}));

export default function BookingsPage() {
  const currentDate = new Date().toISOString().split("T")[0];

  // Categorize trips dynamically
  const completedTrips: Trip[] = unifiedTrips.filter((trip) => trip.date < currentDate);
  const pendingTrips: Trip[] = unifiedTrips.filter((trip) => trip.date >= currentDate);

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <BookingsTable title="Requested Trips" trips={requestedData.requestedTrips as unknown as Trip[]} />
          <BookingsTable title="Canceled Trips" trips={canceledData.canceledTrips as unknown as Trip[]} />
          <BookingsTable title="Completed & Pending Trips" trips={[...completedTrips, ...pendingTrips]} />
        </div>
      </div>
    </DashboardLayout>
  );
}
