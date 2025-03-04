"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Check, AlertTriangle } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

interface AddPriceDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  boatId: string;
  ezsailCommissionPercentage: number;
  previousItineraries: string[];
  onPriceAdded?: () => void;
}

export default function AddPriceDialog({
  open,
  setOpen,
  boatId,
  ezsailCommissionPercentage,
  previousItineraries,
  onPriceAdded,
}: AddPriceDialogProps) {
  const [newPrice, setNewPrice] = useState({
    charterType: "Half Day",
    itineraryName: "",
    rentalPriceWithoutCommission: "",
    commission: "",
    fuelCost: "",
  });

  const [vat, setVat] = useState<number>(0);
  const [ezSailCommission, setEzSailCommission] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const netBoatRentalWithoutCommission = Number(newPrice.rentalPriceWithoutCommission);
    const commission = Number(newPrice.commission);
    const fuelCost = Number(newPrice.fuelCost);

    if (
      isNaN(netBoatRentalWithoutCommission) ||
      isNaN(commission) ||
      isNaN(fuelCost) ||
      netBoatRentalWithoutCommission < 0 ||
      commission < 0 ||
      fuelCost < 0
    ) {
      setVat(0);
      setEzSailCommission(0);
      setFinalPrice(0);
      return;
    }

    // 1) netBoatRentalWithoutVAT = Net Boat Rental without Commission + Commission
    const netBoatRentalWithoutVAT = netBoatRentalWithoutCommission + commission;
    // 2) VAT = netBoatRentalWithoutVAT * 0.24
    const vatValue = netBoatRentalWithoutVAT * 0.24;
    // 3) Boat Rental/Day = netBoatRentalWithoutVAT + VAT
    const boatRentalDay = netBoatRentalWithoutVAT + vatValue;
    // 4) Price VAT & Fuel Included = Boat Rental/Day + Fuel Cost
    const priceVATAndFuelIncluded = boatRentalDay + fuelCost;
    // 5) EzSail Sea Services Commission = netBoatRentalWithoutVAT * (ezsailCommissionPercentage / 100)
    const ezSailCommissionValue = netBoatRentalWithoutVAT * (ezsailCommissionPercentage / 100);
    // 6) Final Price = Price VAT & Fuel Included + EzSail Sea Services Commission
    const finalPriceValue = priceVATAndFuelIncluded + ezSailCommissionValue;

    setVat(vatValue);
    setEzSailCommission(ezSailCommissionValue);
    setFinalPrice(finalPriceValue);
  }, [
    newPrice.rentalPriceWithoutCommission,
    newPrice.commission,
    newPrice.fuelCost,
    ezsailCommissionPercentage,
  ]);

  async function createCharterItinerary(data: {
    boatId: string;
    charterType: string;
    itineraryName: string;
    rentalPriceWithoutCommission: number;
    commission: number;
    fuelCost: number;
  }) {
    const response = await fetch(`/api/b2b/boats/${data.boatId}/charterItineraries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        charterType: data.charterType,
        itineraryName: data.itineraryName,
        rentalPriceWithoutCommission: data.rentalPriceWithoutCommission,
        commission: data.commission,
        fuelCost: data.fuelCost,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create charter itinerary");
    }
    return response.json();
  }

  const handleSave = async () => {
    if (
      !newPrice.itineraryName.trim() ||
      isNaN(Number(newPrice.rentalPriceWithoutCommission)) ||
      isNaN(Number(newPrice.commission)) ||
      isNaN(Number(newPrice.fuelCost))
    ) {
      setError("All fields must have valid numbers before submitting.");
      return;
    }

    setError(null);

    try {
      const result = await createCharterItinerary({
        boatId,
        charterType: newPrice.charterType,
        itineraryName: newPrice.itineraryName,
        rentalPriceWithoutCommission: Number(newPrice.rentalPriceWithoutCommission),
        commission: Number(newPrice.commission),
        fuelCost: Number(newPrice.fuelCost),
      });

      toast.success("Price successfully added!", {
        description: `Final Price: €${Number(result.finalPrice).toFixed(2)}`,
      });

      setNewPrice({
        charterType: "Half Day",
        itineraryName: "",
        rentalPriceWithoutCommission: "",
        commission: "",
        fuelCost: "",
      });
      setOpen(false);
      onPriceAdded?.();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Error saving price. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-xl p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Price
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Charter Type */}
          <div className="space-y-2">
            <Label>Charter Type</Label>
            <Select
              value={newPrice.charterType}
              onValueChange={(value) => setNewPrice({ ...newPrice, charterType: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Charter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="Full Day">Full Day</SelectItem>
                <SelectItem value="VIP Transfer">VIP Transfer</SelectItem>
                <SelectItem value="Sunset Cruise">Sunset Cruise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Charter Itinerary Name with Autocomplete */}
          <div className="space-y-2">
            <Label>Charter Itinerary Name</Label>
            <Command>
              <CommandInput
                placeholder="Enter Charter Itinerary name"
                value={newPrice.itineraryName}
                onValueChange={(value) =>
                  setNewPrice({ ...newPrice, itineraryName: value })
                }
              />
              <CommandList>
                {previousItineraries
                  .filter((name) =>
                    name.toLowerCase().includes(newPrice.itineraryName.toLowerCase())
                  )
                  .map((name, index) => (
                    <CommandItem
                      key={`${name}-${index}`}
                      onSelect={(currentValue) =>
                        setNewPrice({ ...newPrice, itineraryName: currentValue })
                      }
                    >
                      {name}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </div>

          {/* Rental Price Without Commission */}
          <div className="space-y-2">
            <Label>Net Rental Price (€)</Label>
            <Input
              type="number"
              placeholder="0.00"
              min="0"
              value={newPrice.rentalPriceWithoutCommission}
              onChange={(e) =>
                setNewPrice({
                  ...newPrice,
                  rentalPriceWithoutCommission: e.target.value,
                })
              }
            />
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <Label>Commission (€)</Label>
            <Input
              type="number"
              placeholder="0.00"
              min="0"
              value={newPrice.commission}
              onChange={(e) =>
                setNewPrice({ ...newPrice, commission: e.target.value })
              }
            />
          </div>

          {/* VAT & Fuel Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VAT (24%) (€)</Label>
              <Input type="text" value={vat.toFixed(2)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Fuel Cost (€)</Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                value={newPrice.fuelCost}
                onChange={(e) =>
                  setNewPrice({ ...newPrice, fuelCost: e.target.value })
                }
              />
            </div>
          </div>

          {/* EzSail Commission & Final Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>EzSail Commission ({ezsailCommissionPercentage}%) (€)</Label>
              <Input type="text" value={ezSailCommission.toFixed(2)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Final Price (€)</Label>
              <Input type="text" value={finalPrice.toFixed(2)} disabled />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <AlertTriangle className="mr-2" />
            {error}
          </div>
        )}

        <Button className="w-full mt-4" onClick={handleSave} disabled={!!error}>
          <Check className="mr-2" /> Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
