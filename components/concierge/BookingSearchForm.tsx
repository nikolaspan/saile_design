"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import boatsData from "@/components/concierge/boats.json";

interface Boat {
  boatId: string;
  name: string;
  destinations: string[];
  prices: Partial<Record<string, Record<string, number>>>;
  capacity: number;
  notAvailableDates: string[];
  tripTypes: string[];
  itinerary: { name: string; price: number }[];
}

// Define the structure of JSON.
interface BoatsData {
  boats: Boat[];
}

// Convert the imported JSON to our type.
const { boats: allBoats } = boatsData as BoatsData;

// Extract unique destinations from all boats.
const availableDestinations = Array.from(
  new Set(allBoats.flatMap((boat) => boat.destinations))
);

interface BookingSearchFormProps {
  destination: string;
  setDestination: (value: string) => void;
  passengerCount: number;
  setPassengerCount: (value: number) => void;
  date: Date | null;
  setDate: (value: Date) => void;
  tripType: string;
  setTripType: (value: string) => void;
  onSearch: () => void;
}

const BookingSearchForm: React.FC<BookingSearchFormProps> = ({
  destination,
  setDestination,
  passengerCount,
  setPassengerCount,
  date,
  setDate,
  tripType,
  setTripType,
  onSearch,
}) => {
  // Local state to control whether the dropdown is visible.
  const [focused, setFocused] = useState(false);

  // Filter suggestions based on user input (case-insensitive).
  const filteredSuggestions = destination
    ? availableDestinations.filter((dest) =>
        dest.toLowerCase().includes(destination.toLowerCase())
      )
    : availableDestinations;

  return (
    <div className="space-y-4 p-6 shadow-md rounded-lg">
      <h2 className="text-3xl font-bold text-center">New Booking</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination field using shadcn Command for autofill */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Destination</label>
          <Command className="rounded-md border border-gray-200">
            <CommandInput
              placeholder="Enter destination (e.g. Mykonos, Santorini)"
              value={destination}
              onValueChange={(value) => setDestination(value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="border-0 outline-none focus:ring-0"
            />
            {focused && (
              <CommandList className="max-h-60 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      // Use onMouseDown so that the click registers before blur.
                      onMouseDown={() => setDestination(suggestion)}
                    >
                      {suggestion}
                    </CommandItem>
                  ))
                ) : (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
              </CommandList>
            )}
          </Command>
        </div>

        {/* Passenger Count using shadcn Input */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">
            Number of Passengers
          </label>
          <Input
            type="number"
            placeholder="Enter number of passengers"
            value={passengerCount > 0 ? passengerCount.toString() : ""}
            onChange={(e) => setPassengerCount(Number(e.target.value))}
          />
        </div>

        {/* Date Picker using shadcn DatePicker */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Choose Day</label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        {/* Trip Type using shadcn Select */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Trip Type</label>
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Trip Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-day">Full-day</SelectItem>
              <SelectItem value="Half-day">Half-day</SelectItem>
              <SelectItem value="VIP Transfer">VIP Transfer</SelectItem>
              <SelectItem value="Sunset Cruise">Sunset Cruise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={onSearch} disabled={!destination || passengerCount <= 0 || !date}>
          Search Boats
        </Button>
      </div>
    </div>
  );
};

export default BookingSearchForm;
