"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Import request data from JSON
import requestsData from "@/components/b2b/requests.json";

//  Define Request Type including `declineReason`, `hotel`, and `time`
type Request = {
  id: number;
  boatId: number;
  charterType: string;
  itineraryName: string;
  requester: string;
  hotel: string;
  date: string;
  time: string;
  status: "Pending" | "Accepted" | "Declined";
  declineReason: string;
};

export default function RequestManagementPage() {
  const router = useRouter();

  // ✅ Ensure `declineReason` is included in state initialization
  const [requests, setRequests] = useState<Request[]>(
    requestsData.requests.map((req) => ({
      ...req,
      status: req.status as "Pending" | "Accepted" | "Declined",
      declineReason: req.declineReason || "",
    }))
  );

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"Accepted" | "Declined">("Accepted");

  const handleAction = () => {
    if (selectedRequest) {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === selectedRequest.id
            ? { ...request, status: actionType, declineReason: actionType === "Declined" ? declineReason : "" }
            : request
        )
      );
      setShowConfirmDialog(false);
      setShowDeclineDialog(false);
      setDeclineReason("");
    }
  };

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">Manage Requests</h1>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests (Foreign Boats)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Charter Type</TableHead>
                    <TableHead>Itinerary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <TableRow key={request.id} className="transition-colors">
                        <TableCell onClick={() => router.push(`/dashboard/b2b/request/${request.id}`)} className="cursor-pointer">
                          {request.hotel}
                        </TableCell>
                        <TableCell onClick={() => router.push(`/dashboard/b2b/request/${request.id}`)} className="cursor-pointer">
                          {request.date} at {request.time}
                        </TableCell>
                        <TableCell onClick={() => router.push(`/dashboard/b2b/request/${request.id}`)} className="cursor-pointer">
                          {request.charterType}
                        </TableCell>
                        <TableCell onClick={() => router.push(`/dashboard/b2b/request/${request.id}`)} className="cursor-pointer">
                          {request.itineraryName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`px-3 py-1 rounded-full ${
                              request.status === "Accepted" ? "bg-green-500" :
                              request.status === "Declined" ? "bg-red-500" : "bg-yellow-500"
                            } text-white`}
                          >
                            {request.status}
                          </Badge>
                          {request.status === "Declined" && request.declineReason && (
                            <p className="text-xs text-red-500 mt-1">Reason: {request.declineReason}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.status === "Pending" ? (
                            <div className="flex gap-4">
                              {/* Accept Button */}
                              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevents navigation
                                      setSelectedRequest(request);
                                      setActionType("Accepted");
                                      setShowConfirmDialog(true);
                                    }}
                                  >
                                    Accept
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Accept</DialogTitle>
                                  </DialogHeader>
                                  <p>Are you sure you want to accept this request?</p>
                                  <DialogFooter>
                                    <Button variant="secondary" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleAction}>Confirm</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              {/* Decline Button */}
                              <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevents navigation
                                      setSelectedRequest(request);
                                      setActionType("Declined");
                                      setShowDeclineDialog(true);
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Decline Request</DialogTitle>
                                  </DialogHeader>
                                  <p>Please enter a reason for declining:</p>
                                  <Textarea
                                    placeholder="Reason for decline..."
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    className="w-full mt-2"
                                  />
                                  <DialogFooter>
                                    <Button variant="secondary" onClick={() => setShowDeclineDialog(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleAction} disabled={!declineReason.trim()}>Confirm</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <span className="text-gray-500">Processed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No pending requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
