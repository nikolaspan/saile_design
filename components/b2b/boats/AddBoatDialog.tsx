"use client";

import { useState } from "react";
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

export type Boat = {
  id: number;
  name: string;
  type: string;
  length: number;
  capacity: number;
  hotel: string;
  origin: "Local" | "Foreign";
};

type AddBoatDialogProps = {
  onAdd: (boat: Omit<Boat, "id">) => void;
};

export default function AddBoatDialog({ onAdd }: AddBoatDialogProps) {
  const [open, setOpen] = useState(false);
  const [newBoat, setNewBoat] = useState<Omit<Boat, "id">>({
    name: "",
    type: "Catamaran",
    length: 0,
    capacity: 0,
    hotel: "Seaside Resort",
    origin: "Local",
  });

  const handleAddBoat = () => {
    if (
      !newBoat.name ||
      newBoat.length <= 0 ||
      newBoat.capacity <= 0 ||
      !newBoat.hotel
    )
      return;
    onAdd(newBoat);
    setNewBoat({
      name: "",
      type: "Catamaran",
      length: 0,
      capacity: 0,
      hotel: "Seaside Resort",
      origin: "Local",
    });
    setOpen(false);
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
        {/* Dark overlay to dim the background */}
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="z-50 max-w-md p-6 rounded-md shadow-lg  ">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Boat
            </DialogTitle>
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
              <Label className="block text-sm font-medium">Type *</Label>
              <Select
                key={`boat-type-${open}`}
                value={newBoat.type}
                onValueChange={(value) =>
                  setNewBoat({ ...newBoat, type: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Boat Type" />
                </SelectTrigger>
                <SelectContent>
                  {["Catamaran", "Yacht", "Monohull", "RIB", "Speedboat"].map(
                    (type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
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
              <Select
                key={`hotel-${open}`}
                value={newBoat.hotel}
                onValueChange={(value) =>
                  setNewBoat({ ...newBoat, hotel: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Hotel" />
                </SelectTrigger>
                <SelectContent>
                  {["Seaside Resort", "Mountain View Lodge"].map((hotel) => (
                    <SelectItem
                      key={hotel}
                      value={hotel}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      {hotel}
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
                  <Label htmlFor="local" className="cursor-pointer">
                    Local
                  </Label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="Foreign" id="foreign" />
                  <Label htmlFor="foreign" className="cursor-pointer">
                    Foreign
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddBoat}
                variant="default"
                className="text-sm px-4 py-2"
              >
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
