"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


// If "birthday" is provided, it will be used; otherwise, we'll show "birthId".
type Trip = {
  tripId: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  date: string;
  roomId: string;
  passengers: {
    passengerId: string;
    name: string;
    birthId?: string;
    birthday?: string;
  }[];
};

// Define the shape of the JSON
interface TripsJson {
  trips: Trip[];
}


import tripsDataRaw from "@/components/concierge/trips.json";
const tripsData = tripsDataRaw as unknown as TripsJson;

export default function BookingDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const role = "Concierge";

  // Find the booking where the tripId matches the id from the route
  const booking: Trip | undefined = tripsData.trips.find(
    (trip: Trip) => trip.tripId === id
  );

  if (!booking) {
    return (
      <DashboardLayout role={role}>
        <div className="p-6">
          <p>Booking not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{booking.itineraryName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Booking Information */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <p>
                  <strong>Trip ID:</strong> {booking.tripId}
                </p>
                <p>
                  <strong>Charter Type:</strong> {booking.charterType}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {format(parseISO(booking.date), "yyyy-MM-dd")}
                </p>
                <p>
                  <strong>Revenue:</strong> ${booking.revenue}
                </p>
                <p>
                  <strong>Room ID:</strong> {booking.roomId}
                </p>
              </div>
            </div>
            {/* Passengers Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold mb-2">Passengers</h3>
              <div className="flex flex-col gap-3">
                {booking.passengers.map((passenger) => (
                  <div
                    key={passenger.passengerId}
                    className="flex flex-col md:flex-row items-start md:items-center gap-2 border p-3 rounded-md"
                  >
                    <p className="font-medium flex-1">{passenger.name}</p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Badge className="px-3 py-1 rounded-full">
                        ID: {passenger.passengerId}
                      </Badge>
                      <Badge className="px-3 py-1 rounded-full">
                        Birthday: {passenger.birthday ?? passenger.birthId}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
