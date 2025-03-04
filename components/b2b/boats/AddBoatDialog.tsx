"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// This is the shape used for the form state.
type NewBoatForm = {
  name: string;
  boatType: string;
  length: number;
  capacity: number;
  hotelId: string;
  origin: "Local" | "Foreign";
};

// Unified Boat type used by all components.
// Note: id is a string and we convert origin into isForeign.
export type Boat = {
  id: string;
  name: string;
  boatType: string;
  length: number;
  capacity: number;
  hotel: { name: string };
  isForeign: boolean;
};

type Hotel = {
  id: number;
  name: string;
};

type AddBoatDialogProps = {
  onAdd: (boat: Boat) => void;
};

export default function AddBoatDialog({ onAdd }: AddBoatDialogProps) {
  const [open, setOpen] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [newBoat, setNewBoat] = useState<NewBoatForm>({
    name: "",
    boatType: "Catamaran",
    length: 0,
    capacity: 0,
    hotelId: "",
    origin: "Local",
  });

  // Fetch connected hotels from the API.
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // Adjust URL if your endpoint for connected hotels is different.
        const response = await fetch("/api/b2b/hotels");
        const data: { hotels: Hotel[] } = await response.json();
        if (Array.isArray(data.hotels)) {
          setHotels(data.hotels);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setHotelError("Failed to load hotels");
      }
    };
    fetchHotels();
  }, []);

  // Auto-select the hotel if only one is available.
  useEffect(() => {
    if (hotels.length === 1 && !newBoat.hotelId) {
      setNewBoat((prev) => ({ ...prev, hotelId: String(hotels[0].id) }));
    }
  }, [hotels, newBoat.hotelId]);

  // Submit new boat to API.
  const handleAddBoat = async () => {
    if (
      !newBoat.name ||
      newBoat.length <= 0 ||
      newBoat.capacity <= 0 ||
      !newBoat.hotelId
    )
      return;

    // Construct payload to match API expectations.
    const payload = {
      hotelId: newBoat.hotelId, // Do not convert to number
      name: newBoat.name,
      boatType: newBoat.boatType,
      capacity: newBoat.capacity,
      length: newBoat.length,
      isForeign: newBoat.origin === "Foreign",
    };

    try {
      const response = await fetch("/api/b2b/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Log response details for debugging.
        const errorText = await response.text();
        console.error("Failed to add boat:", response.status, errorText);
        throw new Error("Failed to add boat");
      }

      // Convert the returned id to string if needed.
      const createdBoatRaw = await response.json();
      const createdBoat: Boat = {
        ...createdBoatRaw,
        id: String(createdBoatRaw.id),
      };
      onAdd(createdBoat);
      setNewBoat({
        name: "",
        boatType: "Catamaran",
        length: 0,
        capacity: 0,
        hotelId: "",
        origin: "Local",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding boat:", error);
    }
  };

  return (
    <div className="relative">
      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="px-6 py-3 text-white dark:bg-slate-700 font-semibold rounded-full"
          >
            + Add Boat
          </Button>
        </DialogTrigger>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="z-50 max-w-md p-6 rounded-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Boat</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            Please fill in the details of your boat. All fields are required.
          </p>
          <div className="grid gap-4">
            <div>
              <Label className="block text-sm font-medium">Name *</Label>
              <Input
                placeholder="Enter boat name"
                value={newBoat.name}
                onChange={(e) =>
                  setNewBoat({ ...newBoat, name: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium">Boat Type *</Label>
              <Select
                key={`boat-type-${open}`}
                value={newBoat.boatType}
                onValueChange={(value) =>
                  setNewBoat({ ...newBoat, boatType: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Boat Type" />
                </SelectTrigger>
                <SelectContent>
                  {["Catamaran", "Yacht", "Monohull", "RIB", "Speedboat"].map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium">
                  Length (ft) *
                </Label>
                <Input
                  type="number"
                  placeholder="Boat length"
                  value={newBoat.length}
                  onChange={(e) =>
                    setNewBoat({ ...newBoat, length: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium">
                  Capacity (Passengers) *
                </Label>
                <Input
                  type="number"
                  placeholder="Boat capacity"
                  min="1"
                  value={newBoat.capacity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0)
                      setNewBoat({ ...newBoat, capacity: value });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium">Hotel *</Label>
              {hotelError && (
                <p className="text-red-500 text-sm mb-1">{hotelError}</p>
              )}
              <Select
                key={`hotel-${open}`}
                value={newBoat.hotelId}
                onValueChange={(value) =>
                  setNewBoat({ ...newBoat, hotelId: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={String(hotel.id)}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium">Origin *</Label>
              <RadioGroup
                value={newBoat.origin}
                onValueChange={(value) =>
                  setNewBoat({ ...newBoat, origin: value as "Local" | "Foreign" })
                }
                className="flex gap-4 mt-1"
              >
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="Local" id="local" />
                  <Label htmlFor="local">Local</Label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="Foreign" id="foreign" />
                  <Label htmlFor="foreign">Foreign</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddBoat} variant="default">
                Add Boat
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute top-2 right-2">
              ×
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
