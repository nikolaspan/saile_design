"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../layouts/DashboardLayout";
import Calendar from "@/components/concierge/Calendar";
import TripsTable from "@/components/concierge/TripsTable";
import useSWR from "swr";

type Booking = {
  id: string;
  boatName: string;
  bookingDate: string;
  type: string;
  status: string;
  roomNumber?: string | null;
  charterItinerary?: { id: string; name: string } | null;
  itineraries?: { id: string; name: string; price: number }[];
};

// API Fetcher function (moved outside for efficiency)
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

export default function ConciergeDashboard() {
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

  // Fetch bookings using SWR
  const { data, error, isValidating } = useSWR(
    conciergeId ? `/api/bookings?conciergeId=${conciergeId}` : null,
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
        <p>Welcome! Search for boats and manage bookings from here.</p>

        {/* Error Message */}
        {error && <p className="text-red-500">Failed to load bookings. Please try again.</p>}

        {/* Pass cached booking data to child components */}
        <Calendar bookings={bookings} loading={isLoading} error={error ? "Failed to load bookings." : null} />
        <TripsTable bookings={bookings} loading={isLoading} error={error ? "Failed to load bookings." : null} />

        <div className="mt-36" />
      </div>
    </DashboardLayout>
  );
}
