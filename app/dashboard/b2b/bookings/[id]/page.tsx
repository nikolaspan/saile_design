"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseISO, format, isToday } from "date-fns";
import React from "react";

interface Passenger {
  id: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  nationality: string;
}

interface BookingData {
  id: string;
  bookingDateTime: string;
  type: string; // using "type" from your schema (BookingType)
  charterItinerary: { name: string };
  boat: { 
    name: string;
    hotel?: { name: string }; // use optional chaining in case hotel is missing
  };
  status: string;
  passengers: Passenger[];
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  let booking: BookingData | null = null;
  try {
    if (dataParam) {
      booking = JSON.parse(decodeURIComponent(dataParam)) as BookingData;
    }
  } catch (error) {
    console.error("Failed to parse booking data", error);
  }

  if (!booking) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const bookingDate = parseISO(booking.bookingDateTime);
  const computedStatus = isToday(bookingDate)
    ? "Ongoing"
    : bookingDate.getTime() < new Date().getTime()
    ? "Completed"
    : booking.status;

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        <h1 className="text-2xl font-bold mb-4">Booking Details</h1>

        <div className="shadow rounded-lg p-6 space-y-4">
          <p>
            <strong>Booking ID:</strong> {booking.id}
          </p>
          <p>
            <strong>Booking Date:</strong> {format(bookingDate, "yyyy-MM-dd HH:mm")}
          </p>
          <p>
            <strong>Charter Type:</strong> {booking.type}
          </p>
          <p>
            <strong>Charter Itinerary:</strong> {booking.charterItinerary.name}
          </p>
          <p>
            <strong>Boat Name:</strong> {booking.boat.name}
          </p>
          <p>
            <strong>Hotel Name:</strong> {booking.boat.hotel?.name || "N/A"}
          </p>
          <div>
            <strong>Status:</strong>{" "}
            <Badge variant="secondary">{computedStatus}</Badge>
          </div>
          <div>
            <strong>Passengers:</strong>
            {booking.passengers && booking.passengers.length > 0 ? (
              <ul className="list-disc list-inside">
                {booking.passengers.map((passenger) => (
                  <li key={passenger.id}>
                    {passenger.fullName} – {passenger.nationality} – ID: {passenger.idNumber}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No passengers found.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
