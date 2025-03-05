"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AnalyticsFilterProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  boatNameFilter: string;
  setBoatNameFilter: (value: string) => void;
  onExport: () => void;
}

export const AnalyticsFilter: React.FC<AnalyticsFilterProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  boatNameFilter,
  setBoatNameFilter,
  onExport,
}) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Start Date:</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">End Date:</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Boat Name:</label>
        <Input
          type="text"
          placeholder="Filter by Boat Name"
          value={boatNameFilter}
          onChange={(e) => setBoatNameFilter(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="mt-2 sm:mt-0">
        <Button onClick={onExport}>Export CSV</Button>
      </div>
    </div>
  );
};
