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
  numberOfPassengers: string;
}

// Helper: Convert a date from DD-MM-YYYY to ISO (YYYY-MM-DD) for filtering.
const convertDateForFiltering = (dateStr: string): string => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};



// Normalize numeric strings ensuring two decimals.
const normalizeNumber = (value: string | null | undefined): string => {
  if (!value) return "0.00";
  const normalized = value.toString().replace(",", ".").replace(/[^0-9.]/g, "");
  const num = parseFloat(normalized);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// Map the imported JSON to ensure correct type casting for charterType.
const yachtData: YachtData[] = (Array.isArray(data) ? data : [data]).map(item => ({
  ...item,
  charterType: item.charterType as YachtData["charterType"],
}));

// CSV export 
const exportToCSV = (exportData: YachtData[]) => {
  // Define header mapping with keys typed as keyof YachtData.
  const headers: { label: string; key: keyof YachtData }[] = [
    { label: "Date", key: "date" },
    { label: "Boat Name", key: "boatName" },
    { label: "Charter Type", key: "charterType" },
    { label: "Charter Name", key: "charterName" },
    { label: "Net Boat Rental without Commission", key: "netBoatRentalWithoutCommission" },
    { label: "Commission", key: "commission" },
    { label: "Net Boat Rental without VAT", key: "netBoatRentalWithoutVAT" },
    { label: "VAT 24%", key: "vat24" },
    { label: "Boat Rental/Day", key: "boatRentalDay" },
    { label: "Fuel Cost", key: "fuelCost" },
    { label: "Price VAT & Fuel Included", key: "priceVATAndFuelIncluded" },
    { label: "EzSail Sea Services Commission", key: "ezSailSeaServicesCommission" },
    { label: "Final", key: "final" },
    { label: "Number of Passengers", key: "numberOfPassengers" },
  ];

  // Build CSV .
  const csvRows: string[] = [];
  // Create header 
  csvRows.push(headers.map(h => `"${h.label}"`).join(","));

  exportData.forEach(row => {
    const rowArray = headers.map(h => {
      let cell = row[h.key];
      // Normalize numeric fields
      if (
        [
          "netBoatRentalWithoutCommission",
          "commission",
          "netBoatRentalWithoutVAT",
          "vat24",
          "boatRentalDay",
          "fuelCost",
          "priceVATAndFuelIncluded",
          "ezSailSeaServicesCommission",
          "final",
        ].includes(h.key)
      ) {
        cell = normalizeNumber(cell);
      }
      return `"${cell}"`;
    });
    csvRows.push(rowArray.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "yacht_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function YachtTable() {
  // Filter state.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [boatNameFilter, setBoatNameFilter] = useState("");

  // Filter the data by date and boat name.
  const filteredData = yachtData.filter(row => {
    const matchesBoatName =
      boatNameFilter === "" ||
      row.boatName.toLowerCase().includes(boatNameFilter.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const rowDateISO = convertDateForFiltering(row.date);
      if (startDate && endDate) {
        matchesDate = rowDateISO >= startDate && rowDateISO <= endDate;
      } else if (startDate) {
        matchesDate = rowDateISO === startDate;
      } else if (endDate) {
        matchesDate = rowDateISO === endDate;
      }
    }
    return matchesBoatName && matchesDate;
  });

  return (
    <Card className="m-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Analytics Table</h2>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Start Date:</label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">End Date:</label>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Boat Name:</label>
            <Input
              type="text"
              placeholder="Filter by Boat Name"
              value={boatNameFilter}
              onChange={e => setBoatNameFilter(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="mt-2 sm:mt-0">
            <Button onClick={() => exportToCSV(filteredData)}>Export CSV</Button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full text-sm">
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
                <TableHead>Number of Passengers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.boatName}</TableCell>
                  <TableCell>{row.charterType}</TableCell>
                  <TableCell>{row.charterName}</TableCell>
                  <TableCell>{normalizeNumber(row.netBoatRentalWithoutCommission)}</TableCell>
                  <TableCell>{normalizeNumber(row.commission)}</TableCell>
                  <TableCell>{normalizeNumber(row.netBoatRentalWithoutVAT)}</TableCell>
                  <TableCell>{normalizeNumber(row.vat24)}</TableCell>
                  <TableCell>{normalizeNumber(row.boatRentalDay)}</TableCell>
                  <TableCell>{normalizeNumber(row.fuelCost)}</TableCell>
                  <TableCell>{normalizeNumber(row.priceVATAndFuelIncluded)}</TableCell>
                  <TableCell>{normalizeNumber(row.ezSailSeaServicesCommission)}</TableCell>
                  <TableCell>{normalizeNumber(row.final)}</TableCell>
                  <TableCell>{row.numberOfPassengers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
