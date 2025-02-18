"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [newBoat, setNewBoat] = useState<Omit<Boat, "id">>({
    name: "",
    type: "Catamaran",
    length: 0,
    capacity: 0,
    hotel: "Seaside Resort",
    origin: "Local",
  });

  const handleAddBoat = () => {
    if (!newBoat.name || newBoat.length <= 0 || newBoat.capacity <= 0 || !newBoat.hotel) return;
    onAdd(newBoat);
    setNewBoat({ name: "", type: "Catamaran", length: 0, capacity: 0, hotel: "Seaside Resort", origin: "Local" });
  };

  return (
    <div className="relative">
      <div className="mt-4 flex justify-start">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="px-5 py-3 text-white dark:bg-slate-700 font-semibold rounded-full">+ Add Boat</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm p-4">
            <DialogHeader>
              <DialogTitle className="text-lg">Add New Boat</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Enter boat name"
                  value={newBoat.name}
                  onChange={(e) => setNewBoat({ ...newBoat, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newBoat.type}
                  onValueChange={(value) => setNewBoat({ ...newBoat, type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Boat Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Catamaran", "Yacht", "Monohull", "RIB", "Speedboat"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Length (ft)</Label>
                  <Input
                    type="number"
                    placeholder="Enter boat length"
                    value={newBoat.length}
                    onChange={(e) => setNewBoat({ ...newBoat, length: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Capacity (People)</Label>
                  <Input
                    type="number"
                    placeholder="Enter boat capacity"
                    min="1"
                    value={newBoat.capacity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0) setNewBoat({ ...newBoat, capacity: value });
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Hotel</Label>
                <Select
                  value={newBoat.hotel}
                  onValueChange={(value) => setNewBoat({ ...newBoat, hotel: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Seaside Resort", "Mountain View Lodge"].map((hotel) => (
                      <SelectItem key={hotel} value={hotel}>
                        {hotel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Origin</Label>
                <RadioGroup
                  value={newBoat.origin}
                  onValueChange={(value) => setNewBoat({ ...newBoat, origin: value as "Local" | "Foreign" })}
                  className="flex gap-4"
                >
                  <RadioGroupItem value="Local" id="local" />
                  <Label htmlFor="local">Local</Label>
                  <RadioGroupItem value="Foreign" id="foreign" />
                  <Label htmlFor="foreign">Foreign</Label>
                </RadioGroup>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddBoat} variant="default" className="text-sm px-3 py-2">
                  Add Boat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
