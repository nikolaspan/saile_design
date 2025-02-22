"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import BookingSearchForm from "@/components/concierge/BookingSearchForm";
import BoatSelection, { Boat } from "@/components/concierge/BoatSelection";
import PassengerForm, { PassengerInfo, ItineraryOption } from "@/components/concierge/PassengerForm";
import { useToast } from "@/hooks/use-toast";

import boatsData from "@/components/concierge/boats.json";
const allBoats = boatsData.boats as unknown as Boat[];


// Import preloaded tentative bookings and convert via unknown
import preloadedTentativeBookings from "@/components/concierge/tentativeBookings.json";
const initialTentativeBookings = preloadedTentativeBookings as unknown as Booking[];

interface Booking {
  bookingType: "Definitive" | "Tentative";
  selectedBoat: Boat;
  date: string;
  passengers: PassengerInfo[];
  itineraries: ItineraryOption[];
  hour: string;
}

export default function NewBookingPage() {
  const role = "Concierge";
  const [step, setStep] = useState<number>(1);
  const [destination, setDestination] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [date, setDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<string>("Full-day");
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryOption[]>([]);
  const [hour, setHour] = useState<string>("");
  const [tentativeBookings, setTentativeBookings] = useState<Booking[]>(initialTentativeBookings);

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDateParam = urlParams.get("date");
    if (selectedDateParam) {
      setDate(new Date(selectedDateParam));
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

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: unknown) => {
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
      setSelectedItinerary((prev) => prev.filter((item) => item.name !== option.name));
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

    const formattedDate = format(date, "yyyy-MM-dd");
    const bookingDetails: Booking = {
      ...data,
      selectedBoat,
      date: formattedDate,
    };

    if (data.bookingType === "Tentative") {
      setTentativeBookings((prev) => [...prev, bookingDetails]);
      toast({
        title: "Tentative booking saved!",
        description: "Your tentative booking is saved. A definitive booking can replace this later.",
      });
      // Reset state
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
      setIsSubmitting(false);
      return;
    }

    if (data.bookingType === "Definitive") {
      setTentativeBookings((prev) =>
        prev.filter(
          (booking) =>
            !(booking.selectedBoat.boatId === selectedBoat.boatId && booking.date === formattedDate)
        )
      );
    }

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
        // Reset state
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
            bookingDate={date ? format(date, "yyyy-MM-dd") : ""}
            tentativeBookings={tentativeBookings}
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
