"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// Updated analytics data type.
export type YachtData = {
  date: string;
  passengerCount: number;
  confirmedBy: string;
  itinerary: string;
  status: string;
  comments: string;
  boatName: string;
  charterName: string;
  charterType: string;
  netBoatRentalWithoutCommission: string;
  commission: string;
  netBoatRentalWithoutVAT: string;
  vat24: string;
  boatRentalDay: string;
  fuelCost: string;
  priceVATAndFuelIncluded: string;
  ezSailSeaServicesCommission: string;
  finalPrice: string;
};

// Table headers for the UI.
const tableHeaders: { label: string; key: keyof YachtData }[] = [
  { label: "Date", key: "date" },
  { label: "Boat Name", key: "boatName" },
  { label: "Charter Type", key: "charterType" },
  { label: "Charter Name", key: "charterName" },
  { label: "Price+vat", key: "priceVATAndFuelIncluded" },
  { label: "EzSailCommission", key: "ezSailSeaServicesCommission" },
  { label: "Final Price", key: "finalPrice" },
];

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface AnalyticsTableProps {
  data: YachtData[];
  onSort: (column: keyof YachtData, order: "asc" | "desc") => void;
}

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ data, onSort }) => {
  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-[800px] max-h-[400px] overflow-auto">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header, idx) => (
                <TableHead 
                  key={idx} 
                  onClick={() => onSort(header.key, 'asc')} 
                  className="cursor-pointer"
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {tableHeaders.map((header, jdx) => {
                  let cell = "";
                  if (header.key === "date") {
                    cell = formatDate(row.date);
                  } else {
                    cell = row[header.key] as string;
                  }
                  return <TableCell key={jdx}>{cell}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
