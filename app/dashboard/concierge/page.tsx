"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DashboardLayout from "../../layouts/DashboardLayout";
import Calendar from "@/components/concierge/Calendar";
import TripsTable from "@/components/concierge/TripsTable";

// Define the Booking type that matches our API response.
export type Booking = {
  id: string;
  boatName: string;
  bookingDate: string;
  type: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary?: { id: string; name: string } | null;
  itineraries?: { id: string; name: string; price: number }[];
  passengersCount: number;
};

// API fetcher function.
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

export default function ConciergeBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conciergeId, setConciergeId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/");
    } else if (session.user.role?.trim().toLowerCase() === "concierge") {
      setConciergeId(session.user.id);
    } else {
      router.replace(`/dashboard/${session.user.role.trim().toLowerCase()}`);
    }
  }, [session, status, router]);

  // Use SWR to fetch bookings for the current concierge.
  const { data, error, isValidating } = useSWR(
    conciergeId ? `/api/concierge/bookings` : null,
    fetcher,
    { shouldRetryOnError: true }
  );

  const bookings: Booking[] = data?.bookings || [];
  const isLoading = isValidating && !data;

  if (status === "loading") return <div className="text-center p-5">Loading...</div>;
  if (!conciergeId) return null;

  return (
    <DashboardLayout role="Concierge">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Concierge Dashboard</h1>
        <p>Welcome! Manage your bookings below.</p>

        {error && <p className="text-red-500">Failed to load bookings. Please try again.</p>}

        {/* Render Calendar and TripsTable components with fetched bookings */}
        <Calendar bookings={bookings} loading={isLoading} error={error ? "Failed to load bookings." : null} />
        <TripsTable bookings={bookings} loading={isLoading} error={error ? "Failed to load bookings." : null} />

        <div className="mt-36" />
      </div>
    </DashboardLayout>
  );
}
