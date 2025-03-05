"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import BookingSearchForm from "@/components/concierge/BookingSearchForm";
import BoatSelection from "@/components/concierge/BoatSelection";
import PassengerForm from "@/components/concierge/PassengerForm";

interface SearchParams {
  charterItineraryName: string;
  tripType: string;
  numPassengers: number;
  date: Date | null;
  boatType: string | null;
}

interface Boat {
  id: string;
  name: string;
  capacity: number;
  boatType: string;
  hasTentative: boolean;
}

interface ItineraryOption {
  name: string;
  price: number;
}

interface BookingFormData {
  passengers: {
    fullName: string;
    idNumber: string;
    birth: Date | null;
  }[];
  itineraries: ItineraryOption[];
  hour: string;
  bookingType: "Definitive" | "Tentative";
}

export default function NewBookingPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    charterItineraryName: "",
    tripType: "",
    numPassengers: 0,
    date: null,
    boatType: null,
  });
  const [boats, setBoats] = useState<Boat[]>([]);
  const [step, setStep] = useState<number>(1);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [conciergeId, setConciergeId] = useState<string | null>(null);

  // Fetch conciergeId from the server on component mount
  useEffect(() => {
    const fetchConciergeId = async () => {
      const response = await fetch("/api/concierge/me");
      const data = await response.json();
      if (data.hotelId) {
        setConciergeId(data.hotelId);
      } else {
        toast({
          title: "Error",
          description: "Concierge not found.",
        });
      }
    };
    fetchConciergeId();
  }, [toast]);

  const handleSearch = async () => {
    if (
      !searchParams.charterItineraryName ||
      !searchParams.tripType ||
      !searchParams.date ||
      searchParams.numPassengers <= 0 ||
      !conciergeId
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields before searching.",
      });
      return;
    }

    const formattedDate = format(searchParams.date, "yyyy-MM-dd");

    let url = `/api/concierge/boats/available?date=${formattedDate}&passengerCount=${searchParams.numPassengers}&charterName=${searchParams.charterItineraryName}&charterType=${searchParams.tripType}&conciergeId=${conciergeId}`;

    if (searchParams.boatType) {
      url += `&boatType=${searchParams.boatType}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setBoats(data.boats);
        setStep(2);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch available boats",
        });
      }
    } catch (error) {
      console.error("Error searching boats:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching for boats.",
      });
    }
  };

  const handleSelectBoat = (boat: Boat) => {
    setSelectedBoat(boat);
    setStep(3);
  };

  const handleSubmitBooking = (data: BookingFormData) => {
    console.log("Submitted booking data:", data);
    // Proceed with API call or further processing
  };

  return (
    <DashboardLayout role="Concierge">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-xl mx-auto">
          {step === 1 && (
            <BookingSearchForm
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onSearch={handleSearch}
              hotelId="5b73ee7b-d760-4f22-b835-d17abc63a049" // Example hotelId, can be replaced
            />
          )}

          {step === 2 && (
            <BoatSelection
              boats={boats}
              onBack={() => setStep(1)}
              bookingDate={format(searchParams.date!, "yyyy-MM-dd")}
              onSelectBoat={handleSelectBoat}
            />
          )}

          {step === 3 && selectedBoat && (
            <PassengerForm
              onBack={() => setStep(2)}
              onSubmit={handleSubmitBooking}
              selectedBoatName={selectedBoat.name}
              itineraryOptions={[]}
              selectedItinerary={[]}
              onItineraryChange={() => {}}
              hour=""
              setHour={() => {}}
              passengerCount={searchParams.numPassengers} // Passing the number of passengers
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
