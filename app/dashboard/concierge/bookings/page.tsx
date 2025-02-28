"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import BookingsTable from "@/components/concierge/BookingsTable";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Define Passenger and Trip Types
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
  boatName: string; // ✅ Ensure boatName is included
  roomId: string;
  boatId: number;
  passengers: Passenger[];
}

interface Booking {
  id: string;
  boatName: string; // ✅ Ensure boatName exists in Booking
  bookingDate: string;
  type: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary?: {
    id: string;
    name: string;
    finalPrice: number;
  } | null;
  itineraries?: {
    id: string;
    name: string;
    price: number;
  }[];
}

const role = "Concierge";

export default function BookingsPage() {
  const { data: session } = useSession();
  const conciergeId = session?.user?.id || "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conciergeId) return;

    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings?conciergeId=${conciergeId}`);
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError("Error fetching bookings. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [conciergeId]);

  const currentDate = new Date().toISOString().split("T")[0];

  // ✅ Convert `Booking[]` to `Trip[]`
  const transformedTrips: Trip[] = bookings.map((booking) => ({
    tripId: booking.id,
    charterType: booking.type,
    itineraryName: booking.charterItinerary?.name || "N/A",
    revenue: booking.charterItinerary?.finalPrice || 0,
    date: booking.bookingDate,
    boatName: booking.boatName || "Unknown Boat", // ✅ Ensure boatName is included
    boatId: parseInt(booking.roomNumber || "0", 10),
    roomId: booking.roomNumber || "N/A",
    passengers: [],
  }));

  // Categorizing trips based on Prisma schema status
  const definitiveAndCompletedTrips = transformedTrips.filter(
    (trip) => bookings.find((b) => b.id === trip.tripId)?.status === "Definitive" || trip.date < currentDate
  );
  const tentativeTrips = transformedTrips.filter(
    (trip) => bookings.find((b) => b.id === trip.tripId)?.status === "Tentative"
  );
  const requestedTrips = transformedTrips.filter(
    (trip) => bookings.find((b) => b.id === trip.tripId)?.status === "Requested"
  );
  const canceledTrips = transformedTrips.filter(
    (trip) => bookings.find((b) => b.id === trip.tripId)?.status === "Cancelled"
  );

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center md:text-left">📅 Bookings</h1>

        {loading ? (
          // 🔥 Creative Loading Animation
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            <p className="text-lg text-gray-600">Fetching bookings...</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-500">
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✅ Definitive & Completed Trips */}
            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">✅ Definitive & Completed</h2>
              <BookingsTable title="Definitive & Completed" trips={definitiveAndCompletedTrips} />
            </div>

            {/* 🕒 Tentative Trips */}
            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">🕒 Tentative</h2>
              <BookingsTable title="Tentative Trips" trips={tentativeTrips} />
            </div>

            {/* 🚀 Requested Trips */}
            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">🚀 Requested</h2>
              <BookingsTable title="Requested Trips" trips={requestedTrips} />
            </div>

            {/* ❌ Canceled Trips */}
            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">❌ Canceled</h2>
              <BookingsTable title="Canceled Trips" trips={canceledTrips} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
