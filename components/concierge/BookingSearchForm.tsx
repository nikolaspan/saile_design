"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div className="space-y-4 p-6 shadow-md rounded-lg">
      <h2 className="text-3xl font-bold text-center">New Booking</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Destination</label>
          <Input
            placeholder="Enter destination (e.g. Mykonos, Santorini)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Passenger Count */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Number of Passengers</label>
          <Input
            type="number"
            placeholder="Enter number of passengers"
            value={passengerCount > 0 ? passengerCount : ""}
            onChange={(e) => setPassengerCount(Number(e.target.value))}
          />
        </div>

        {/* Date Picker */}
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
