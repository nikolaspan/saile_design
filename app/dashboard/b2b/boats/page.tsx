/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddBoatDialog, { Boat } from "@/components/b2b/boats/AddBoatDialog";
import BoatsTable from "@/components/b2b/boats/BoatsTable";

const localBoatsData: Boat[] = [
  {
    id: 1,
    name: "Sea Explorer",
    type: "Yacht",
    length: 50,
    capacity: 10,
    hotel: "Seaside Resort",
  },
  {
    id: 2,
    name: "Ocean Breeze",
    type: "Catamaran",
    length: 40,
    capacity: 8,
    hotel: "Mountain View Lodge",
  },
];

const foreignBoatsData: Boat[] = [
  {
    id: 101,
    name: "Global Voyager",
    type: "Monohull",
    length: 60,
    capacity: 12,
    hotel: "Seaside Resort",
  },
  {
    id: 102,
    name: "World Wanderer",
    type: "RIB",
    length: 30,
    capacity: 6,
    hotel: "Mountain View Lodge",
  },
];

export default function BoatsPage() {
  const [localBoats, setLocalBoats] = useState<Boat[]>(localBoatsData);
  const [foreignBoats, setForeignBoats] = useState<Boat[]>(foreignBoatsData);

  const handleAddLocalBoat = (boat: Omit<Boat, "id">) => {
    setLocalBoats((prev) => [...prev, { ...boat, id: prev.length + 1 }]);
  };

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">Manage Boats</h1>
        <div className="flex justify-end">
          <AddBoatDialog onAdd={handleAddLocalBoat} />
        </div>

        {/* LOCAL BOATS */}
        <Card>
          <CardHeader>
            <CardTitle>Local Boats</CardTitle>
          </CardHeader>
          <CardContent>
            <BoatsTable
              boats={localBoats.filter((boat) => boat.hotel === "Seaside Resort")}
              title="Seaside Resort Boats"
            />
            <BoatsTable
              boats={localBoats.filter((boat) => boat.hotel === "Mountain View Lodge")}
              title="Mountain View Lodge Boats"
            />
          </CardContent>
        </Card>

        {/* FOREIGN BOATS */}
        <Card>
          <CardHeader>
            <CardTitle>Foreign Boats</CardTitle>
          </CardHeader>
          <CardContent>
            <BoatsTable
              boats={foreignBoats.filter((boat) => boat.hotel === "Seaside Resort")}
              title="Seaside Resort Boats"
            />
            <BoatsTable
              boats={foreignBoats.filter((boat) => boat.hotel === "Mountain View Lodge")}
              title="Mountain View Lodge Boats"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
  