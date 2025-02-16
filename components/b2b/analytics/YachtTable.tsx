"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import data from "./data.json";

// Define the shape of a yacht data object.
export interface YachtData {
  date: string;
  boatName: string;
  charterType: "Full Day" | "Half Day" | "VIP Transfer" | "Sunset Cruise";
  charterName: string;
  netBoatRentalWithoutCommission: string;
  commission: string;
  netBoatRentalWithoutVAT: string;
  vat24: string;
  boatRentalDay: string;
  fuelCost: string;
  priceVATAndFuelIncluded: string;
  ezSailSeaServicesCommission: string;
  final: string;
}

// List of keys which should be treated as numeric (doubles)
const numericKeys: (keyof YachtData)[] = [
  "netBoatRentalWithoutCommission",
  "commission",
  "netBoatRentalWithoutVAT",
  "vat24",
  "boatRentalDay",
  "fuelCost",
  "priceVATAndFuelIncluded",
  "ezSailSeaServicesCommission",
  "final",
];

// Helper function: remove non-numeric characters and parse as a double.
const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  return parseFloat(cleaned);
};

// Assert the imported JSON as YachtData[]
const yachtData: YachtData[] = (Array.isArray(data) ? data : [data]) as YachtData[];

// CSV export helper function.
const exportToCSV = (exportData: YachtData[]) => {
  const headers = [
    "Date",
    "Boat Name",
    "Charter Type",
    "Charter Name",
    "Net Boat Rental without Commission",
    "Commission",
    "Net Boat Rental without VAT",
    "VAT 24%",
    "Boat Rental/Day",
    "Fuel Cost",
    "Price VAT & Fuel Included",
    "EzSail Sea Services Commission",
    "Final",
  ];

  const rows = exportData.map((row) =>
    headers.map((header) => {
      // Map header names to the corresponding field key.
      let key: keyof YachtData;
      switch (header) {
        case "Date":
          key = "date";
          break;
        case "Boat Name":
          key = "boatName";
          break;
        case "Charter Type":
          key = "charterType";
          break;
        case "Charter Name":
          key = "charterName";
          break;
        case "Net Boat Rental without Commission":
          key = "netBoatRentalWithoutCommission";
          break;
        case "Commission":
          key = "commission";
          break;
        case "Net Boat Rental without VAT":
          key = "netBoatRentalWithoutVAT";
          break;
        case "VAT 24%":
          key = "vat24";
          break;
        case "Boat Rental/Day":
          key = "boatRentalDay";
          break;
        case "Fuel Cost":
          key = "fuelCost";
          break;
        case "Price VAT & Fuel Included":
          key = "priceVATAndFuelIncluded";
          break;
        case "EzSail Sea Services Commission":
          key = "ezSailSeaServicesCommission";
          break;
        case "Final":
          key = "final";
          break;
        default:
          key = "date"; // fallback (should not occur)
      }
      const value = row[key];
      // If the field is numeric, convert it to a double string.
      if (numericKeys.includes(key)) {
        const num = parseCurrency(value);
        return num.toFixed(2);
      }
      return value;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function YachtTable() {
  // Filter states.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [boatNameFilter, setBoatNameFilter] = useState("");

  // Filter the data by date and boat name.
  const filteredData = yachtData.filter((row) => {
    const matchesBoatName =
      boatNameFilter === "" ||
      row.boatName.toLowerCase().includes(boatNameFilter.toLowerCase());

    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = row.date >= startDate && row.date <= endDate;
    } else if (startDate) {
      matchesDate = row.date === startDate;
    } else if (endDate) {
      matchesDate = row.date === endDate;
    }
    return matchesBoatName && matchesDate;
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Analytics Table</h2>
      </CardHeader>
      <CardContent>
        {/* Filter controls */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Start Date:</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">End Date:</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Boat Name:</label>
            <Input
              type="text"
              placeholder="Filter by Boat Name"
              value={boatNameFilter}
              onChange={(e) => setBoatNameFilter(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={() => exportToCSV(filteredData)}>Export CSV</Button>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Boat Name</TableHead>
                <TableHead>Charter Type</TableHead>
                <TableHead>Charter Name</TableHead>
                <TableHead>Net Boat Rental without Commission</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Boat Rental without VAT</TableHead>
                <TableHead>VAT 24%</TableHead>
                <TableHead>Boat Rental/Day</TableHead>
                <TableHead>Fuel Cost</TableHead>
                <TableHead>Price VAT & Fuel Included</TableHead>
                <TableHead>EzSail Sea Services Commission</TableHead>
                <TableHead>Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.boatName}</TableCell>
                  <TableCell>{row.charterType}</TableCell>
                  <TableCell>{row.charterName}</TableCell>
                  <TableCell>{row.netBoatRentalWithoutCommission}</TableCell>
                  <TableCell>{row.commission}</TableCell>
                  <TableCell>{row.netBoatRentalWithoutVAT}</TableCell>
                  <TableCell>{row.vat24}</TableCell>
                  <TableCell>{row.boatRentalDay}</TableCell>
                  <TableCell>{row.fuelCost}</TableCell>
                  <TableCell>{row.priceVATAndFuelIncluded}</TableCell>
                  <TableCell>{row.ezSailSeaServicesCommission}</TableCell>
                  <TableCell>{row.final}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
