"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Boat {
  id: string;
  name: string;
  capacity: number;
  boatType: string; // Boat type added
  hasTentative: boolean;
}

interface BoatSelectionProps {
  boats: Boat[];
  onBack: () => void;
  bookingDate: string;
  onSelectBoat: (boat: Boat) => void; // onSelectBoat is required here
}

const BoatSelection: React.FC<BoatSelectionProps> = ({ boats, onBack, bookingDate, onSelectBoat }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">
        Available Boats for {bookingDate}
      </h2>
      {boats.length === 0 ? (
        <p className="text-center text-gray-600">
          No boats available for the selected date and passenger count.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {boats.map((boat) => (
            <Card
              key={boat.id}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                boat.hasTentative ? "border-2 border-orange-500" : ""
              }`}
              onClick={() => onSelectBoat(boat)} // Trigger onSelectBoat on click
            >
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-lg font-semibold">{boat.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <p className="text-sm">
                  <strong>Capacity:</strong> {boat.capacity}
                </p>
                <p className="text-sm">
                  <strong>Boat Type:</strong> {boat.boatType}
                </p>
                {boat.hasTentative && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Tentative booking exists. (Definitive can replace it)
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back
        </Button>
      </div>
    </div>
  );
};

export default BoatSelection;
