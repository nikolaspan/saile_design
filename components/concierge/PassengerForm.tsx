import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { DatePicker2 } from "@/components/date-picker2";

export interface PassengerInfo {
  fullName: string;
  idNumber: string;
  birth: Date | null;
  nationality: string;  // Add nationality field
}

export interface ItineraryOption {
  id: string;
  name: string;
  price: number;
}

interface PassengerFormProps {
  onBack: () => void;
  onSubmit: (data: {
    passengers: PassengerInfo[];
    itineraries: ItineraryOption[];
    hour: string;
    bookingType: "Definitive" | "Tentative";
    roomNumber: string;
    boatId: string;
    charterItineraryId: string;
    conciergeId: string;
    b2bId: string;
  }) => void;
  selectedBoatName: string;
  itineraryOptions?: ItineraryOption[];
  selectedItinerary: ItineraryOption[];
  onItineraryChange: (option: ItineraryOption, checked: boolean) => void;
  hour: string;
  setHour: (value: string) => void;
  passengerCount: number;
  boatId: string;
  charterItineraryId: string;
  conciergeId: string;
  b2bId: string;
}

type FormValues = {
  hour: string;
  bookingType: "Definitive" | "Tentative";
  passengers: PassengerInfo[];
  itineraries: ItineraryOption[];
  roomNumber: string;
};

const PassengerForm: React.FC<PassengerFormProps> = ({
  onBack,
  onSubmit,
  selectedBoatName,
  itineraryOptions = [],
  selectedItinerary,
  onItineraryChange,
  hour,
  setHour,
  passengerCount,
  boatId,
  charterItineraryId,
  conciergeId,
  b2bId,
}) => {
  const form = useForm<FormValues>({
    defaultValues: {
      hour,
      bookingType: "Definitive",
      passengers: Array(passengerCount).fill({
        fullName: "",
        idNumber: "",
        birth: null,
        nationality: "",  // Add default value for nationality
      }),
      itineraries: selectedItinerary,
      roomNumber: "",  // Add default value for roomNumber
    },
  });

  const { formState: { isSubmitting } } = form;

  const internalSubmit = form.handleSubmit((data) => {
    // Send the full data including boatId, charterItineraryId, etc.
    const formData = {
      ...data,
      boatId,
      charterItineraryId,
      conciergeId,
      b2bId,
    };
    onSubmit(formData);
  });

  return (
    <Form {...form}>
      <form onSubmit={internalSubmit} className="space-y-6">
        <h2 className="text-xl font-bold">Enter Passenger Information</h2>
        <p>Selected Boat: <strong>{selectedBoatName}</strong></p>

        <FormField control={form.control} name="hour" render={({ field }) => (
          <FormItem>
            <FormLabel>Choose Hour</FormLabel>
            <FormControl>
              <Input
                type="time"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setHour(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Select Additional Itinerary Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {itineraryOptions.length > 0 ? (
              itineraryOptions.map((option) => {
                const isChecked = form.getValues("itineraries").some(
                  (item) => item.name === option.name
                );
                return (
                  <div key={option.name} className="flex items-center space-x-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked: boolean) => {
                        const current = form.getValues("itineraries");
                        if (checked) {
                          form.setValue("itineraries", [...current, option]);
                        } else {
                          form.setValue("itineraries", current.filter((item) => item.name !== option.name));
                        }
                        onItineraryChange(option, checked);
                      }}
                    />
                    <Label className="cursor-pointer">{option.name} ({option.price > 0 ? `$${option.price}` : 'Free'})</Label>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No itinerary options available.</p>
            )}
          </div>
        </div>

        {/* Dynamically create passenger forms */}
        {form.getValues("passengers").map((_, index) => (
          <div key={index} className="border p-4 rounded-md space-y-4">
            <FormField control={form.control} name={`passengers.${index}.fullName`} render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name={`passengers.${index}.idNumber`} render={({ field }) => (
              <FormItem>
                <FormLabel>ID Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter ID number" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name={`passengers.${index}.birth`} render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <FormControl>
                  <DatePicker2 date={field.value || null} setDate={(selectedDate: Date | null) => { field.onChange(selectedDate); }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Add nationality input */}
            <FormField control={form.control} name={`passengers.${index}.nationality`} render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="Enter nationality" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        ))}

        {/* Add room number input */}
        <FormField control={form.control} name="roomNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Room Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter room number" {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="bookingType" render={({ field }) => (
          <FormItem>
            <FormLabel>Booking Type</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue>{field.value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Definitive">Definitive</SelectItem>
                  <SelectItem value="Tentative">Tentative</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={onBack}>Back</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Booking"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default PassengerForm;
