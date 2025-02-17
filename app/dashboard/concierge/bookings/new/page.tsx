"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import BookingSearchForm from "@/components/concierge/BookingSearchForm";
import BoatSelection, { Boat } from "@/components/concierge/BoatSelection";
import PassengerForm, { PassengerInfo, ItineraryOption } from "@/components/concierge/PassengerForm";
import { format } from "date-fns";

// Import boat data
import boatsData from "@/components/concierge/boats.json";
const allBoats = boatsData.boats as unknown as Boat[];

// Import email configuration

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

  // Retrieve the date from the query string
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get("date");
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, []);

  // Step 1: Search for available boats  
  const handleSearch = () => {
    if (!date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    const lowerCaseDestination = destination.toLowerCase();

    const filtered = allBoats.filter((boat: Boat) =>
      boat.destinations.some((dest: string) => dest.toLowerCase() === lowerCaseDestination) &&
      boat.capacity >= passengerCount &&
      !boat.notAvailableDates.includes(formattedDate) &&
      boat.tripTypes.includes(tripType) // Filtering by trip type
    );
    setFilteredBoats(filtered);
    setStep(2);
  };

  // Step 2: Boat selection
  const handleBoatSelect = (boat: Boat) => {
    setSelectedBoat(boat);
    setPassengers(
      Array.from({ length: passengerCount }, () => ({ fullName: "", idNumber: "", birth: "" }))
    );
    setSelectedItinerary([]);
    setStep(3);
  };

  // Step 3: Update passenger info
  const handlePassengerChange = (
    index: number,
    field: keyof PassengerInfo,
    value: string
  ) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleItineraryChange = (option: ItineraryOption, checked: boolean) => {
    if (checked) {
      setSelectedItinerary((prev) => {
        if (prev.some((item) => item.name === option.name)) {
          return prev;
        }
        return [...prev, option];
      });
    } else {
      setSelectedItinerary((prev) =>
        prev.filter((item) => item.name !== option.name)
      );
    }
  };

  // Function to submit the booking and send an email
  const handleSubmit = async () => {
    if (!selectedBoat || !date) return;
  
    const bookingDetails = {
      passengers,
      selectedItinerary,
      hour,
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
        console.log("Booking submitted & emails sent successfully!");
      } else {
        console.error("Email sending failed.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
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
            onSubmit={handleSubmit} // Call handleSubmit here
            onItineraryChange={handleItineraryChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
