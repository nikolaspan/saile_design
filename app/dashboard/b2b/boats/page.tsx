"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BoatsTable from "@/components/b2b/boats/BoatsTable";
import AddBoatDialog, { Boat } from "@/components/b2b/boats/AddBoatDialog";
import { toast } from "sonner";

const fetcher = async (url: string): Promise<Boat[]> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch boats");
    const data = await res.json();
    return data.boats.map((boat: Boat) => ({
      ...boat,
      capacity:
        boat.capacity && !isNaN(Number(boat.capacity))
          ? Number(boat.capacity)
          : 0,
    }));
  } catch (error) {
    console.error("Error fetching boats:", error);
    return [];
  }
};

function groupBoatsByHotel(boats: Boat[]): Record<string, Boat[]> {
  return boats.reduce((groups, boat) => {
    const hotelName = boat.hotel.name;
    if (!groups[hotelName]) {
      groups[hotelName] = [];
    }
    groups[hotelName].push(boat);
    return groups;
  }, {} as Record<string, Boat[]>);
}

export default function BoatsPage() {
  const { data: boatsData, error, mutate } = useSWR<Boat[]>("/api/b2b/boats", fetcher);
  const allBoats: Boat[] = boatsData ?? [];
  const localBoats = allBoats.filter((boat) => !boat.isForeign);
  const foreignBoats = allBoats.filter((boat) => boat.isForeign);
  const localBoatsByHotel = useMemo(() => groupBoatsByHotel(localBoats), [localBoats]);
  const foreignBoatsByHotel = useMemo(() => groupBoatsByHotel(foreignBoats), [foreignBoats]);

  // Define the delete function for boats
  const handleDeleteBoat = async (boatId: string) => {
    try {
      const res = await fetch(`/api/b2b/boats/${boatId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete boat");
      }
      toast.success("Boat deleted successfully");
      await mutate(); // Refresh the boat list
    } catch (error) {
      toast.error(
        "Error deleting boat: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-10">
        {error && <div className="text-red-500">Error loading boats</div>}
        {!boatsData ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Manage Boats</h1>
              <AddBoatDialog onAdd={(newBoat: Boat) => mutate([...allBoats, newBoat], false)} />
            </div>
            {[
              { title: "Local Boats", data: localBoatsByHotel },
              { title: "Foreign Boats", data: foreignBoatsByHotel },
            ].map(({ title, data }) => (
              <div key={title}>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                {Object.entries(data).map(([hotelName, boats]) => (
                  <Card key={hotelName} className="mb-6 shadow-md">
                    <CardHeader className="bg-gray-100 dark:bg-gray-800">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                        {hotelName} - {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Pass the handleDeleteBoat function here */}
                      <BoatsTable boats={boats} onDelete={handleDeleteBoat} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
