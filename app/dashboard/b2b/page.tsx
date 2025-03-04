"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../../layouts/DashboardLayout";
import { parseISO, isToday } from "date-fns";
import useSWR from "swr";
import TripsTable from "@/components/boats/TripsTable";
import TodaysBookings from "@/components/b2b/TodaysBookings";
import { Skeleton } from "@/components/ui/skeleton";

interface Passenger {
  passengerId: string;
  name: string;
  birthday: string;
}

interface Booking {
  id: string;
  bookingDateTime: string;
  charterType: string;
  charterItinerary: { name: string };
  boat: { name: string };
  passengers: Passenger[];
}

// Fix: Ensure we extract `bookings` correctly from the API response
const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : []; // Ensure `bookings` is always an array
};

export default function B2BDashboard() {
  const router = useRouter();
  const { data: bookings = [], error } = useSWR<Booking[]>("/api/b2b/bookings", fetcher);

  if (error) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6">
          <p>Error loading bookings.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bookings) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6 space-y-8">
          <Skeleton className="h-10 w-1/2 rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
      </DashboardLayout>
    );
  }

  // Fix: Ensure `.filter()` works by making sure `bookings` is always an array
  const todaysBookings = bookings?.filter((booking) =>
    isToday(parseISO(booking.bookingDateTime))
  ) ?? [];

  const handleBookingClick = (booking: Booking) => {
    const encodedData = encodeURIComponent(JSON.stringify(booking));
    router.push(`/dashboard/b2b/bookings/${booking.id}?data=${encodedData}`);
  };

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">B2B Dashboard</h1>
        <TodaysBookings bookings={todaysBookings} onBookingClick={handleBookingClick} />
        <TripsTable />
      </div>
    </DashboardLayout>
  );
}
