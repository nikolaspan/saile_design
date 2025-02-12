"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Update the passenger interface to include three fields.
export interface PassengerInfo {
  fullName: string;
  idNumber: string;
  birth: string;
}

export interface ItineraryOption {
  name: string;
  price: number;
}

interface PassengerFormProps {
  passengers: PassengerInfo[];
  onPassengerChange: (index: number, field: keyof PassengerInfo, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  selectedBoatName: string;
  itineraryOptions: ItineraryOption[];
  selectedItinerary: ItineraryOption[];
  onItineraryChange: (option: ItineraryOption, checked: boolean) => void;
  hour: string;
  setHour: (value: string) => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  passengers,
  onPassengerChange,
  onBack,
  onSubmit,
  selectedBoatName,
  itineraryOptions,
  selectedItinerary,
  onItineraryChange,
  hour,
  setHour,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Enter Passenger Information</h2>
      <p>
        Selected Boat: <strong>{selectedBoatName}</strong>
      </p>

      {/* Choose Hour Input */}
      <div className="flex flex-col">
        <Label className="mb-1 text-sm font-semibold">Choose Hour</Label>
        <Input
          type="time"
          value={hour}
          onChange={(e) => setHour(e.target.value)}
        />
      </div>

      {/* Itinerary Selection Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Select Additional Itinerary Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {itineraryOptions.map((option) => (
            <div key={option.name} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItinerary.some((item) => item.name === option.name)}
                onCheckedChange={(checked) =>
                  onItineraryChange(option, checked as boolean)
                }
              />
              <Label className="cursor-pointer">
                {option.name} {option.price > 0 ? `($${option.price})` : "(Free)"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Passenger Information Form */}
      <div className="space-y-4">
        {passengers.map((passenger, index) => (
          <div key={index} className="border p-4 rounded-md space-y-4">
            {/* Full Name Block */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={passenger.fullName}
                onChange={(e) =>
                  onPassengerChange(index, "fullName", e.target.value)
                }
              />
            </div>
            {/* ID Number Block */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">ID Number</Label>
              <Input
                placeholder="Enter ID number"
                value={passenger.idNumber}
                onChange={(e) =>
                  onPassengerChange(index, "idNumber", e.target.value)
                }
              />
            </div>
            {/* Birth Block */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Birth (dd/mm/yyyy)</Label>
              <Input
                type="text"
                placeholder="dd/mm/yyyy"
                pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\d{4}$"
                title="Please enter date in dd/mm/yyyy format"
                value={passenger.birth}
                onChange={(e) =>
                  onPassengerChange(index, "birth", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit}>Submit Booking</Button>
      </div>
    </div>
  );
};

export default PassengerForm;
