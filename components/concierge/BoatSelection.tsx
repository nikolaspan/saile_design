import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Boat {
  boatId: string;
  name: string;
  destinations: string[];
  prices: { [destination: string]: { [tripType: string]: number } };
  capacity: number;
  notAvailableDates: string[];
  itinerary: { name: string; price: number }[];
  tripTypes: string[];
}

interface Booking {
  bookingType: "Definitive" | "Tentative";
  selectedBoat: Boat;
  date: string;
}

interface BoatSelectionProps {
  boats: Boat[];
  destination: string;
  tripType: string;
  onBoatSelect: (boat: Boat) => void;
  onBack: () => void;
  bookingDate: string;
  tentativeBookings: Booking[];
}

const BoatSelection: React.FC<BoatSelectionProps> = ({
  boats,
  destination,
  tripType,
  onBoatSelect,
  onBack,
  bookingDate,
  tentativeBookings,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select a Boat</h2>
      {boats.length === 0 ? (
        <p className="text-muted-foreground">
          No boats available for the given destination, day, and passenger count.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {boats.map((boat) => {
            const matchingKey = Object.keys(boat.prices).find(
              (key) => key.toLowerCase() === destination.toLowerCase()
            );
            const price = matchingKey ? boat.prices[matchingKey][tripType] : undefined;
            const hasTentative = tentativeBookings.some(
              (booking) => booking.selectedBoat.boatId === boat.boatId && booking.date === bookingDate
            );

            return (
              <Card
                key={boat.boatId}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  hasTentative ? "border-2 border-yellow-500" : ""
                }`}
                onClick={() => onBoatSelect(boat)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{boat.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Destination:</strong> {matchingKey || destination}
                    </p>
                    <p className="text-sm">
                      <strong>Capacity:</strong> {boat.capacity}
                    </p>
                    <p className="text-sm">
                      <strong>Price for {matchingKey || destination}:</strong>{" "}
                      {price !== undefined ? `$${price}` : "N/A"}
                    </p>
                  </div>
                  {hasTentative && (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-xs">
                        Tentative Booking Exists
                      </Badge>
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium">Itinerary:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {boat.itinerary.map((item) => (
                        <Badge
                          key={item.name}
                          className="text-xs"
                          variant={item.price > 0 ? "secondary" : "outline"}
                        >
                          {item.price > 0
                            ? `${item.name} ($${item.price})`
                            : item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
    </div>
  );
};

export default BoatSelection;
