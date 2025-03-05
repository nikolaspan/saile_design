"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export type Itinerary = {
  id: string;
  name: string;
  price: number | string;
};

interface ItineraryTableProps {
  itineraries: Itinerary[];
  onDelete: (itineraryId: string) => Promise<void>;
}

export default function ItineraryTable({ itineraries, onDelete }: ItineraryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItinerary) return;

    setLoading(true);
    try {
      await onDelete(selectedItinerary.id);
      // Removed duplicate toast here.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete itinerary.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedItinerary(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Itineraries</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price (€)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itineraries.map((itinerary) => (
            <TableRow key={itinerary.id}>
              <TableCell>{itinerary.name}</TableCell>
              <TableCell>€{Number(itinerary.price).toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(itinerary)}>
                  <Trash2 className="mr-2" size={16} /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Please confirm that you want to delete the itinerary.
            </DialogDescription>
          </DialogHeader>
          <p>
            Are you sure you want to delete &quot;{selectedItinerary?.name}&quot;?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
