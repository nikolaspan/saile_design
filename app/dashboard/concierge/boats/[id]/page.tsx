/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Itinerary {
  id: string;
  name: string;
  price: any; // price might be returned as a string or Decimal
}

interface CharterItinerary {
  id: string;
  name: string;
  type: string;
  finalPrice: any; // finalPrice might be returned as a string or Decimal
}

interface BoatData {
  id: string;
  name: string;
  boatType: string;
  length: number;
  capacity: number;
  itineraries?: Itinerary[];
  charterItineraries?: CharterItinerary[];
}

const BoatDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const boatId = params?.id as string;

  // Attempt to use passed data via query string.
  const dataParam = searchParams.get("data");
  let initialBoatData: BoatData | null = null;
  if (dataParam) {
    try {
      initialBoatData = JSON.parse(dataParam);
    } catch (error) {
      console.error("Error parsing boat data from query string:", error);
    }
  }

  const [boat, setBoat] = useState<BoatData | null>(initialBoatData);
  const [loading, setLoading] = useState<boolean>(!initialBoatData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boatId) {
      setError("Boat ID not found in URL.");
      setLoading(false);
      return;
    }

    // If initial data does not include itineraries, fetch full details from the API.
    if (!initialBoatData || !initialBoatData.itineraries || !initialBoatData.charterItineraries) {
      const fetchBoatDetails = async () => {
        try {
          const res = await fetch(`/api/boats/${boatId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch boat details");
          }
          const data = await res.json();
          setBoat(data.boat);
        } catch (err: any) {
          console.error("Error fetching boat details:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBoatDetails();
    } else {
      setLoading(false);
    }
  }, [boatId, initialBoatData]);

  if (loading) {
    return (
      <DashboardLayout role="Concierge">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Loading Boat Details...</h1>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !boat) {
    return (
      <DashboardLayout role="Concierge">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-red-600">{error || "Boat not found"}</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Concierge">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{boat.name} – Details</h1>
        
        {/* Boat Basic Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {boat.name}</p>
            <p><strong>Type:</strong> {boat.boatType}</p>
            <p><strong>Length:</strong> {boat.length} m</p>
            <p><strong>Capacity:</strong> {boat.capacity}</p>
          </CardContent>
        </Card>

        {/* Itineraries */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Itineraries</CardTitle>
          </CardHeader>
          <CardContent>
            {boat.itineraries && boat.itineraries.length > 0 ? (
              boat.itineraries.map((itinerary) => (
                <p key={itinerary.id}>
                  <strong>{itinerary.name}</strong> – $
                  {Number(itinerary.price).toFixed(2)}
                </p>
              ))
            ) : (
              <p>No itineraries available.</p>
            )}
          </CardContent>
        </Card>

        {/* Charter Itineraries */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Charter Itineraries</CardTitle>
          </CardHeader>
          <CardContent>
            {boat.charterItineraries && boat.charterItineraries.length > 0 ? (
              boat.charterItineraries.map((charter) => (
                <p key={charter.id}>
                  <strong>{charter.name}</strong> ({charter.type}) – $
                  {Number(charter.finalPrice).toFixed(2)}
                </p>
              ))
            ) : (
              <p>No charter itineraries available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BoatDetailsPage;
