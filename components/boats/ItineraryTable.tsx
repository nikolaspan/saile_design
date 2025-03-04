import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Itinerary = {
  id: string;
  name: string;
  price: number | string;
};

interface ItineraryTableProps {
  itineraries: Itinerary[];
  onDelete: (id: string) => Promise<void>;
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
      toast.success("Itinerary deleted successfully!");
    } catch {
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
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{selectedItinerary?.name}&quot;?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>{loading ? "Deleting..." : "Confirm Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
