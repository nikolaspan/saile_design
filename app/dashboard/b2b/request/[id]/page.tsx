"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import requestsData from "@/components/b2b/requests.json";

// Define Request Type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Request = {
  id: number;
  boatId: number;
  charterType: string;
  itineraryName: string;
  requester: string;
  date: string;
  status: "Pending" | "Accepted" | "Declined";
};

export default function RequestDetailsPage() {
  const { id } = useParams();
  const request = requestsData.requests.find((req) => req.id === Number(id));

  if (!request) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-red-500">Request Not Found</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Request Details</h1>

        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Requester:</strong> {request.requester}
            </div>
            <div>
              <strong>Itinerary:</strong> {request.itineraryName}
            </div>
            <div>
              <strong>Charter Type:</strong> {request.charterType}
            </div>
            <div>
              <strong>Date:</strong> {request.date}
            </div>
            <div>
              <strong>Status:</strong>
              <Badge
                className={`px-3 py-1 rounded-full ${
                  request.status === "Accepted" ? "bg-green-500" :
                  request.status === "Declined" ? "bg-red-500" : "bg-yellow-500"
                } text-white ml-2`}
              >
                {request.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
