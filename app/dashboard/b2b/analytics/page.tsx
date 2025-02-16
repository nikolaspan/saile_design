"use client";

import React from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { YachtTable } from "@/components/b2b/analytics/YachtTable";

export default function AnalyticsPage() {
  return (
    <DashboardLayout role="B2B">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <YachtTable />
      </div>
    </DashboardLayout>
  );
}
