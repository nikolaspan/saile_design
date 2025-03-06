"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import BookingsTable from "@/components/concierge/BookingsTable";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Passenger {
  passengerId: string;
  name: string;
  birthday: string;
}

interface CharterItinerary {
  id: string;
  name: string;
  type: string;
  finalPrice: number;
}

interface Booking {
  id: string;
  boatName: string;
  bookingDateTime: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary: CharterItinerary | null;
  boat: {
    name: string;
  };
}

interface Trip {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  boatName: string;
  roomId: string;
  boatId: number;
  passengers: Passenger[];
  status: string; // Ensure the status property is included
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

  // Ensure bookings is defined and has data before transforming
  const transformedTrips: Trip[] = bookings && bookings.length > 0 ? bookings.map((booking) => ({
    tripId: booking.id,
    charterType: booking.charterItinerary?.type || "N/A",
    itineraryName: booking.charterItinerary?.name || "N/A",
    revenue: booking.charterItinerary?.finalPrice || 0,
    date: format(new Date(booking.bookingDateTime), "yyyy-MM-dd"),
    boatName: booking.boat.name || "Unknown Boat",
    boatId: parseInt(booking.roomNumber || "0", 10),
    roomId: booking.roomNumber || "N/A",
    passengers: [],
    status: booking.status, // Add the status from the booking
  })) : [];

  const currentDate = new Date().toISOString().split("T")[0];

  // Filter trips by status
  const definitiveAndCompletedTrips = transformedTrips.filter(
    (trip) => trip.status === "Definitive" || trip.date < currentDate
  );
  const tentativeTrips = transformedTrips.filter(
    (trip) => trip.status === "Tentative"
  );
  const requestedTrips = transformedTrips.filter(
    (trip) => trip.status === "Requested"
  );
  const canceledTrips = transformedTrips.filter(
    (trip) => trip.status === "Cancelled"
  );

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center md:text-left">📅 Bookings</h1>

        {loading ? (
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
            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">✅ Definitive & Completed</h2>
              <BookingsTable title="Definitive & Completed" trips={definitiveAndCompletedTrips} />
            </div>

            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">🕒 Tentative</h2>
              <BookingsTable title="Tentative Trips" trips={tentativeTrips} />
            </div>

            <div className="shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-3">🚀 Requested</h2>
              <BookingsTable title="Requested Trips" trips={requestedTrips} />
            </div>

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
