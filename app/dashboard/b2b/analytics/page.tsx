"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AnalyticsFilter } from "@/components/b2b/analytics/AnalyticsFilter";
import { AnalyticsTable, YachtData } from "@/components/b2b/analytics/AnalyticsTable";

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR<YachtData[]>("/api/b2b/bookings/analytics", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [boatNameFilter, setBoatNameFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof YachtData | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setBoatNameFilter("");
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data
      .filter((row) => {
        const matchesBoatName =
          boatNameFilter === "" || row.boatName.toLowerCase().includes(boatNameFilter.toLowerCase());
        const matchesDateRange = 
          (startDate ? new Date(row.date) >= new Date(startDate) : true) &&
          (endDate ? new Date(row.date) <= new Date(endDate) : true);
        
        return matchesBoatName && matchesDateRange;
      })
      .sort((a, b) => {
        if (!sortColumn) return 0;
        
        const valA = a[sortColumn] as string | number;
        const valB = b[sortColumn] as string | number;
        
        if (sortOrder === "asc") {
          return valA < valB ? -1 : 1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [data, boatNameFilter, startDate, endDate, sortColumn, sortOrder]);

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available for export!");
      return;
    }

    const headers = [
      "Pax", "Confirmed by", "F&B", "Status", "Comments", "Boat", "Cruise", "Duration",
      "Net Boat Rental without Commission", "Commission", "Net Boat Rental without VAT",
      "VAT 24%", "Boat Rental/Day", "Fuel Cost", "Final Price VAT & Fuel Included", "EzSail Sea Services Commission"
    ];
    
    const csvRows = [headers.join(",")];

    filteredData.forEach((row) => {
      const values = [
        row.passengerCount, row.confirmedBy, row.itinerary, row.status, row.comments,
        row.boatName, row.charterName, row.charterType, row.netBoatRentalWithoutCommission,
        row.commission, row.netBoatRentalWithoutVAT, row.vat24, row.boatRentalDay,
        row.fuelCost, row.priceVATAndFuelIncluded, row.ezSailSeaServicesCommission
      ].map(val => `"${val}"`).join(",");
      csvRows.push(values);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role="B2B">
      <Card>
        <CardHeader><h2>Analytics Table</h2></CardHeader>
        <CardContent>
          <AnalyticsFilter 
            startDate={startDate} 
            setStartDate={setStartDate} 
            endDate={endDate} 
            setEndDate={setEndDate} 
            boatNameFilter={boatNameFilter} 
            setBoatNameFilter={setBoatNameFilter} 
            onExport={exportToCSV}
            onReset={resetFilters}
          />
          {isLoading && <p>Loading...</p>}
          {error && <p>Error loading data</p>}
          {!isLoading && !error && <AnalyticsTable data={filteredData} onSort={(column, order) => { setSortColumn(column); setSortOrder(order); }} />}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
