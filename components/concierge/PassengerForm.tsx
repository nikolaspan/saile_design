"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
// Make sure DatePicker2 exists at the specified path
import { DatePicker2 } from "@/components/date-picker2";

export interface PassengerInfo {
  fullName: string;
  idNumber: string;
  birth: Date | null;
}

export interface ItineraryOption {
  name: string;
  price: number;
}

interface PassengerFormProps {
  passengers: PassengerInfo[];
  onPassengerChange: (index: number, field: keyof PassengerInfo, value: unknown) => void;
  onBack: () => void;
  onSubmit: (data: {
    passengers: PassengerInfo[];
    itineraries: ItineraryOption[];
    hour: string;
    bookingType: "Definitive" | "Tentative";
  }) => void;
  selectedBoatName: string;
  itineraryOptions?: ItineraryOption[];
  selectedItinerary: ItineraryOption[];
  onItineraryChange: (option: ItineraryOption, checked: boolean) => void;
  hour: string;
  setHour: (value: string) => void;
}

type FormValues = {
  hour: string;
  bookingType: "Definitive" | "Tentative";
  passengers: PassengerInfo[];
  itineraries: ItineraryOption[];
};

const PassengerForm: React.FC<PassengerFormProps> = ({
  passengers,
  onPassengerChange,
  onBack,
  onSubmit,
  selectedBoatName,
  itineraryOptions = [],
  selectedItinerary,
  onItineraryChange,
  hour,
  setHour,
}) => {
  const form = useForm<FormValues>({
    defaultValues: {
      hour,
      bookingType: "Definitive",
      passengers: passengers,
      itineraries: selectedItinerary,
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const internalSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={internalSubmit} className="space-y-6">
        <h2 className="text-xl font-bold">Enter Passenger Information</h2>
        <p>
          Selected Boat: <strong>{selectedBoatName}</strong>
        </p>

        <FormField
          control={form.control}
          name="hour"
          render={({ field }) => (
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
          )}
        />

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
                          form.setValue(
                            "itineraries",
                            current.filter((item) => item.name !== option.name)
                          );
                        }
                        onItineraryChange(option, checked);
                      }}
                    />
                    <Label
                      className="cursor-pointer"
                      onClick={() => {
                        const newChecked = !isChecked;
                        const current = form.getValues("itineraries");
                        if (newChecked) {
                          form.setValue("itineraries", [...current, option]);
                        } else {
                          form.setValue(
                            "itineraries",
                            current.filter((item) => item.name !== option.name)
                          );
                        }
                        onItineraryChange(option, newChecked);
                      }}
                    >
                      {option.name} {option.price > 0 ? `($${option.price})` : "(Free)"}
                    </Label>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No itinerary options available.</p>
            )}
          </div>
        </div>

        {passengers.map((_, index) => (
          <div key={index} className="border p-4 rounded-md space-y-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.fullName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onPassengerChange(index, "fullName", e.target.value);
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`passengers.${index}.idNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter ID number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onPassengerChange(index, "idNumber", e.target.value);
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`passengers.${index}.birth`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <DatePicker2
                      date={field.value || null}
                      setDate={(selectedDate: Date | null) => {
                        field.onChange(selectedDate);
                        onPassengerChange(index, "birth", selectedDate);
                      }}
                      startYear={1900}
                      endYear={new Date().getFullYear()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <FormField
          control={form.control}
          name="bookingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange as (value: string) => void}>
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
          )}
        />

        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Booking"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PassengerForm;
