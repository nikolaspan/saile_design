"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import BookingSearchForm from "@/components/concierge/BookingSearchForm";
import BoatSelection, { Boat } from "@/components/concierge/BoatSelection";
import PassengerForm, { PassengerInfo, ItineraryOption } from "@/components/concierge/PassengerForm";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast"

import { useRouter } from "next/navigation";

// Import boat data
import boatsData from "@/components/concierge/boats.json";
const allBoats = boatsData.boats as unknown as Boat[];

export default function NewBookingPage() {
  const role = "Concierge";
  const [step, setStep] = useState<number>(1);
  const [destination, setDestination] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [date, setDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<string>("Full-day");
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  // Initialize passengers with birth as null (Date | null)
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryOption[]>([]);
  const [hour, setHour] = useState<string>("");

  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter(); //future update   
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get("date");
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, []);

  const handleSearch = () => {
    if (!date) {
      toast({
        title: "Missing Date",
        description: "Please select a date before searching.",
      });
      return;
    }
    const formattedDate = format(date, "yyyy-MM-dd");
    const lowerCaseDestination = destination.toLowerCase();

    const filtered = allBoats.filter((boat: Boat) =>
      boat.destinations.some((dest: string) => dest.toLowerCase() === lowerCaseDestination) &&
      boat.capacity >= passengerCount &&
      !boat.notAvailableDates.includes(formattedDate) &&
      boat.tripTypes.includes(tripType)
    );
    setFilteredBoats(filtered);
    setStep(2);
  };

  const handleBoatSelect = (boat: Boat) => {
    setSelectedBoat(boat);
    setPassengers(
      Array.from({ length: passengerCount }, () => ({
        fullName: "",
        idNumber: "",
        birth: null,
      }))
    );
    setSelectedItinerary([]);
    setStep(3);
  };

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerInfo,
    value: unknown
  ) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleItineraryChange = (option: ItineraryOption, checked: boolean): void => {
    if (checked) {
      setSelectedItinerary((prev) => {
        if (prev.some((item) => item.name === option.name)) return prev;
        return [...prev, option];
      });
    } else {
      setSelectedItinerary((prev) =>
        prev.filter((item) => item.name !== option.name)
      );
    }
  };

  const handleSubmit = async (data: {
    passengers: PassengerInfo[];
    itineraries: ItineraryOption[];
    hour: string;
    bookingType: "Definitive" | "Tentative";
  }) => {
    if (!date) {
      toast({
        title: "Missing Date",
        description: "Please select a date before submitting your booking.",
      });
      return;
    }
    if (!selectedBoat) {
      toast({
        title: "Missing Boat",
        description: "Please select a boat before submitting your booking.",
      });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const bookingDetails = {
      ...data,
      selectedBoat,
      date: format(date, "yyyy-MM-dd"),
    };

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      });
      if (response.ok) {
        toast({
          title: "Booking submitted!",
          description: "Your booking email was sent successfully.",
        });
        // Reset state and go back to BookingSearchForm (step 1)
        setStep(1);
        setDestination("");
        setPassengerCount(0);
        setDate(null);
        setTripType("Full-day");
        setFilteredBoats([]);
        setSelectedBoat(null);
        setPassengers([]);
        setSelectedItinerary([]);
        setHour("");
        // Optionally, force a page reload if needed:
        // router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Email sending failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Internal Server Error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="p-6 space-y-6">
        {step === 1 && (
          <BookingSearchForm
            destination={destination}
            setDestination={setDestination}
            passengerCount={passengerCount}
            setPassengerCount={setPassengerCount}
            date={date}
            setDate={setDate}
            tripType={tripType}
            setTripType={setTripType}
            onSearch={handleSearch}
          />
        )}

        {step === 2 && (
          <BoatSelection
            boats={filteredBoats}
            destination={destination}
            tripType={tripType}
            onBoatSelect={handleBoatSelect}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedBoat && (
          <PassengerForm
            passengers={passengers}
            onPassengerChange={handlePassengerChange}
            onBack={() => setStep(2)}
            selectedBoatName={selectedBoat.name}
            itineraryOptions={selectedBoat.itinerary}
            selectedItinerary={selectedItinerary}
            hour={hour}
            setHour={setHour}
            onSubmit={handleSubmit}
            onItineraryChange={handleItineraryChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
