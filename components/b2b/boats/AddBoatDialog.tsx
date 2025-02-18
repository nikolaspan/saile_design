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

export type Boat = {
  id: number;
  name: string;
  type: string;
  length: number;
  capacity: number;
  hotel: string; // Added hotel field
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
    hotel: "Seaside Resort", // Default hotel
  });

  const handleAddBoat = () => {
    if (!newBoat.name || newBoat.length <= 0 || newBoat.capacity <= 0 || !newBoat.hotel) return;
    onAdd(newBoat);
    setNewBoat({ name: "", type: "Catamaran", length: 0, capacity: 0, hotel: "Seaside Resort" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <span className="mr-2">Add Boat</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Boat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Name</Label>
          <Input
            placeholder="Enter boat name"
            value={newBoat.name}
            onChange={(e) => setNewBoat({ ...newBoat, name: e.target.value })}
          />
          <Label>Type</Label>
          <Select
            value={newBoat.type}
            onValueChange={(value) => setNewBoat({ ...newBoat, type: value })}
          >
            <SelectTrigger className="w-full">
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
          <Label>Length (ft)</Label>
          <Input
            type="number"
            placeholder="Enter boat length"
            value={newBoat.length}
            onChange={(e) =>
              setNewBoat({ ...newBoat, length: Number(e.target.value) })
            }
          />
          <Label>Capacity (People)</Label>
          <Input
            type="number"
            placeholder="Enter boat capacity"
            value={newBoat.capacity}
            onChange={(e) =>
              setNewBoat({ ...newBoat, capacity: Number(e.target.value) })
            }
          />
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
          <Button onClick={handleAddBoat} variant="default" className="w-full">
            Add Boat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
