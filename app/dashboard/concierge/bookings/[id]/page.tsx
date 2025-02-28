"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function BookingDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Retrieve the booking data from the "data" query parameter.
  const dataParam = searchParams.get("data");
  let booking: Booking | null = null;
  if (dataParam) {
    try {
      booking = JSON.parse(dataParam) as Booking;
    } catch (err) {
      console.error("Error parsing booking data from query:", err);
    }
  }

  if (!booking) {
    return (
      <DashboardLayout role="Concierge">
        <div className="p-6">
          <p>Booking not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const bookingDate = booking.bookingDate ? parseISO(booking.bookingDate) : null;
  const dateDisplay = bookingDate ? format(bookingDate, "yyyy-MM-dd") : "No Date";
  const timeDisplay = bookingDate ? format(bookingDate, "hh:mm a") : "No Time";

  return (
    <DashboardLayout role="Concierge">
      <div className="p-6 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{booking.boatName} Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <p>
                  <strong>Booking ID:</strong> {booking.id}
                </p>
                <p>
                  <strong>Boat:</strong> {booking.boatName}
                </p>
                <p>
                  <strong>Date:</strong> {dateDisplay}
                </p>
                <p>
                  <strong>Time:</strong> {timeDisplay}
                </p>
                <p>
                  <strong>Type:</strong> {booking.type}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                <p>
                  <strong>Room Number:</strong> {booking.roomNumber || "N/A"}
                </p>
                {booking.charterItinerary && (
                  <p>
                    <strong>Charter Itinerary:</strong> {booking.charterItinerary.name}
                  </p>
                )}
              </div>
            </div>
            {booking.itineraries && booking.itineraries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Selected Itineraries</h3>
                <ul className="list-disc list-inside">
                  {booking.itineraries.map((itinerary) => (
                    <li key={itinerary.id} className="text-sm">
                      {itinerary.name} - ${itinerary.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
