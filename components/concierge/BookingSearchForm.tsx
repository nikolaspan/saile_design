import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DatePicker from "@/components/ui/date-picker";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

interface CharterItinerary {
  id: string;
  name: string;
}

interface BookingSearchFormProps {
  hotelId: string;
  searchParams: {
    charterItineraryName: string;
    tripType: string;
    numPassengers: number;
    date: Date | null;
    boatType: string | null;
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      charterItineraryName: string;
      tripType: string;
      numPassengers: number;
      date: Date | null;
      boatType: string | null;
    }>
  >;
  onSearch: () => void;
}

const BookingSearchForm: React.FC<BookingSearchFormProps> = ({
  hotelId,
  searchParams,
  setSearchParams,
  onSearch,
}) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CharterItinerary[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { charterItineraryName } = searchParams;

  useEffect(() => {
    const handler = setTimeout(() => {
      if (charterItineraryName.trim().length > 0) {
        setLoadingSuggestions(true);
        fetch(
          `/api/concierge/ai-suggestions?hotelId=${hotelId}&query=${encodeURIComponent(
            charterItineraryName
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data.itineraries || []);
          })
          .catch((error) => {
            console.error("Error fetching suggestions:", error);
          })
          .finally(() => setLoadingSuggestions(false));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [charterItineraryName, hotelId]);

  const boatTypes = ["All", "Catamaran", "RIB", "Speedboat", "Yacht", "Monohull"];

  return (
    <div className="rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Search Available Boats
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Charter Itinerary Name with AI Autofill */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Charter Itinerary Name</label>
          <Command>
            <CommandInput
              placeholder="Enter Charter Itinerary Name"
              value={charterItineraryName}
              onValueChange={(value) =>
                setSearchParams({
                  ...searchParams,
                  charterItineraryName: value,
                })
              }
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
            />
            {open && (
              <CommandList>
                {loadingSuggestions ? (
                  <CommandEmpty>Loading suggestions...</CommandEmpty>
                ) : suggestions.length === 0 ? (
                  <CommandEmpty>No itineraries found</CommandEmpty>
                ) : (
                  suggestions.map((itinerary) => (
                    <CommandItem
                      key={itinerary.id}
                      onSelect={() =>
                        setSearchParams({
                          ...searchParams,
                          charterItineraryName: itinerary.name,
                        })
                      }
                    >
                      {itinerary.name}
                    </CommandItem>
                  ))
                )}
              </CommandList>
            )}
          </Command>
        </div>
        {/* Trip Type */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Trip Type</label>
          <Select
            value={searchParams.tripType}
            onValueChange={(value: string) =>
              setSearchParams({ ...searchParams, tripType: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Trip Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FullDay">Full Day</SelectItem>
              <SelectItem value="HalfDay">Half Day</SelectItem>
              <SelectItem value="VipTransfer">VIP Transfer</SelectItem>
              <SelectItem value="SunsetCruise">Sunset Cruise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Boat Type Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Boat Type</label>
          <Select
            value={searchParams.boatType || ""}
            onValueChange={(value: string) =>
              setSearchParams({ ...searchParams, boatType: value || null })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Boat Type" />
            </SelectTrigger>
            <SelectContent>
              {boatTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Number of Passengers */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Number of Passengers</label>
          <Input
            type="number"
            className="w-full"
            placeholder="Enter number of passengers"
            value={
              searchParams.numPassengers > 0
                ? searchParams.numPassengers.toString()
                : ""
            }
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                numPassengers: Number(e.target.value),
              })
            }
          />
        </div>
        {/* Date Picker */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Select Date</label>
          <div className="w-full">
            <DatePicker
              value={searchParams.date}
              onChange={(date) =>
                setSearchParams({ ...searchParams, date: date })
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button onClick={onSearch} className="w-full sm:w-auto">
          Search Boats
        </Button>
      </div>
    </div>
  );
};

export default BookingSearchForm;
