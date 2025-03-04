import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown } from "lucide-react";

export type PriceItem = {
  id: string;
  name: string;
  type: string;
  netBoatRentalWithoutCommission?: number | string;
  commission?: number | string;
  netBoatRentalWithoutVAT?: number | string;
  vat?: number | string;
  boatRentalDay?: number | string;
  fuelCost?: number | string;
  priceVATAndFuelIncluded?: number | string;
  ezsailSeaServicesCommission?: number | string;
  finalPrice?: number | string;
};

interface PriceListTableProps {
  priceList: PriceItem[];
}

// Helper function to format numbers
function formatNumber(value: number | string | undefined): string {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

export default function PriceListTable({ priceList }: PriceListTableProps) {
  const [charterFilter, setCharterFilter] = useState<string>("All");
  const [itineraryFilter, setItineraryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredPriceList = priceList.filter((price: PriceItem) => {
    const charterMatches = charterFilter === "All" || price.type === charterFilter;
    const itineraryMatches =
      !itineraryFilter ||
      price.name.toLowerCase().includes(itineraryFilter.toLowerCase());
    return charterMatches && itineraryMatches;
  });

  const sortedPriceList = [...filteredPriceList].sort((a, b) => {
    return sortOrder === "asc"
      ? (Number(a.finalPrice) || 0) - (Number(b.finalPrice) || 0)
      : (Number(b.finalPrice) || 0) - (Number(a.finalPrice) || 0);
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Price List</h2>

      {/* Filters */}
      <div className="p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <Label className="mb-1">Charter Type</Label>
          <Select value={charterFilter} onValueChange={(value) => setCharterFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Charter Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="FullDay">Full Day</SelectItem>
              <SelectItem value="HalfDay">Half Day</SelectItem>
              <SelectItem value="VipTransfer">VIP Transfer</SelectItem>
              <SelectItem value="SunsetCruise">Sunset Cruise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <Label className="mb-1">Charter Itinerary</Label>
          <Input
            placeholder="Search Charter Itinerary"
            className="w-64"
            value={itineraryFilter}
            onChange={(e) => setItineraryFilter(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <Label className="invisible mb-1">Reset</Label>
          <Button
            variant="outline"
            onClick={() => {
              setCharterFilter("All");
              setItineraryFilter("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg shadow-md overflow-hidden">
        <div className="relative max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className=" top-0 z-10 ">
              <TableRow>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Type</TableHead>
                <TableHead className="text-right">Net Boat Rental (€)</TableHead>
                <TableHead className="text-right">Commission (€)</TableHead>
                <TableHead className="text-right">Net Rental w/o VAT (€)</TableHead>
                <TableHead className="text-right">VAT (€)</TableHead>
                <TableHead className="text-right">Boat Rental Per Day (€)</TableHead>
                <TableHead className="text-right">Fuel Cost (€)</TableHead>
                <TableHead className="text-right">Price VAT & Fuel (€)</TableHead>
                <TableHead className="text-right">Ezsail Commission (€)</TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={toggleSortOrder}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Final Price (€)</span>
                    {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPriceList.length > 0 ? (
                sortedPriceList.map((price: PriceItem) => (
                  <TableRow key={price.id}>
                    <TableCell className="text-left">{price.name}</TableCell>
                    <TableCell className="text-left">{price.type}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.netBoatRentalWithoutCommission)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.commission)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.netBoatRentalWithoutVAT)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.vat)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.boatRentalDay)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.fuelCost)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.priceVATAndFuelIncluded)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.ezsailSeaServicesCommission)}</TableCell>
                    <TableCell className="text-right">€{formatNumber(price.finalPrice)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
