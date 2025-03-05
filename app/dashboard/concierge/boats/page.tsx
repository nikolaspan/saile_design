"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";

// Define the Boat type returned by your API.
// Note: The API returns "id", so we use "id" instead of "boatId"
interface Boat {
  id: string;
  name: string;
  length: number;
  boatType: string;
  capacity: number;
}

// SWR fetcher function.
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch boats");
  return res.json();
};

const BoatsPage = () => {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  // Get concierge id from the session.
  const conciergeId = session?.user?.id || "";

  // Use SWR to fetch boat data.
  const { data, error, isValidating } = useSWR(
    conciergeId ? `/api/boats?conciergeId=${conciergeId}` : null,
    fetcher
  );

  const boats: Boat[] = data?.boats || [];
  const isLoading = isValidating && !data;

  // Filter boats based on search term.
  const filteredBoats = boats.filter((boat) =>
    boat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || !conciergeId || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700">
          Loading Boats...
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout role="Concierge">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Boat Listings</h1>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search boats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full"
        />

        {error && (
          <p className="text-red-500">
            Error loading boats. Please try again.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoats.length > 0 ? (
            filteredBoats.map((boat, index) => (
              <Card key={`${boat.id}-${index}`}>
                <Link
                  href={`/dashboard/concierge/boats/${boat.id}?data=${encodeURIComponent(
                    JSON.stringify(boat)
                  )}`}
                  className="block"
                >
                  <CardHeader>
                    <CardTitle>{boat.name}</CardTitle>
                  </CardHeader>
                  <div className="p-2">
                    <p className="text-sm">Length: {boat.length} m</p>
                    <p className="text-sm">Type: {boat.boatType}</p>
                    <p className="text-sm">Capacity: {boat.capacity}</p>
                  </div>
                  <CardFooter className="justify-center">
                    <Button>Learn More</Button>
                  </CardFooter>
                </Link>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full">No boats found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BoatsPage;
