"use client";

import DashboardLayout from "../../layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
// Import useRouter from next/navigation for client components in the app directory
import { useRouter } from "next/navigation";

import tripsData from "@/components/boats/trips.json";
import TripsTable from "@/components/boats/TripsTable";

export default function B2BDashboard() {
  const router = useRouter(); // Now using next/navigation

  // Get today's bookings
  const todaysBookings = tripsData.trips.filter((trip) =>
    isToday(parseISO(trip.date))
  );

  // Type the parameter 'id' as a number (adjust if your ID is a string)
  const handleBookingClick = (id: number) => {
    router.push(`/dashboard/b2b/bookings/${id}`);
  };

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
            <CardTitle>Today&apos;s Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysBookings.length > 0 ? (
              <ul className="space-y-2">
                {todaysBookings.map((trip) => (
                  <li
                    key={trip.id}
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleBookingClick(trip.id)}
                  >
                    <span>
                      {trip.itineraryName} - {trip.charterType} - Boat:{trip.boatId}
                    </span>
                    <span className="font-bold text-green-600">
                      €{trip.revenue}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No bookings today.</p>
            )}
          </CardContent>
        </Card>

        {/* Replace current table with TripsTable */}
        <TripsTable />
      </div>
    </DashboardLayout>
  );
}
