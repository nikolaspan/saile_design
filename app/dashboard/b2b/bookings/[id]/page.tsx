// app/dashboard/b2b/bookings/[id]/page.tsx

"use client";

import { parseISO, format } from "date-fns";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { trips, getTripStatus, priceList} from "@/components/boats/data"; // Updated import path
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const router = useRouter();
  const tripId = parseInt(params.id, 10);
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { status } = getTripStatus(trip.date);
  const priceItem = priceList.find((p) => p.id === trip.id);

  return (
    <DashboardLayout role="B2B">
      <div className="p-6">
        {/* Back Button that goes to the previous page */}
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        <h1 className="text-2xl font-bold mb-4">Booking Details</h1>
        <div className=" shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{trip.itineraryName}</h2>
          <p className="mb-1">
            <span className="font-medium">Charter Type:</span> {trip.charterType}
          </p>
          <p className="mb-1">
            <span className="font-medium">Date:</span> {format(parseISO(trip.date), "yyyy-MM-dd")}
          </p>
          <p className="mb-1 flex items-center">
            <span className="font-medium mr-2">Status:</span>
            <Badge variant="secondary">{status}</Badge>
          </p>

          {priceItem && (
            <>
              <hr className="my-4" />
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Price Breakdown</h3>
                <ul className="list-disc pl-5">
                  <li>Rental Price: ${priceItem.rentalPrice}</li>
                  <li>Commission: ${priceItem.commission}</li>
                  <li>Fuel Cost: ${priceItem.fuelCost}</li>
                  <li>Final Price: ${priceItem.finalPrice}</li>
                </ul>
              </div>
            </>
          )}

          <hr className="my-4" />


        </div>
      </div>
    </DashboardLayout>
  );
}
