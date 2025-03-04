import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, XCircle } from "lucide-react";
import { toast } from "sonner"; // ✅ Import Sonner notifications

interface AddItineraryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  boatId: string; // Ensures the itinerary is linked to the correct boat
  onItineraryAdded: () => void; // Refresh function
}

export default function AddItineraryDialog({ open, setOpen, boatId, onItineraryAdded }: AddItineraryDialogProps) {
  const [newItinerary, setNewItinerary] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  const handleAddItinerary = async () => {
    if (!newItinerary.name || !newItinerary.price) {
      toast.error("Please enter all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/b2b/boats/${boatId}/itineraries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItinerary.name, price: parseFloat(newItinerary.price) }),
      });

      if (!response.ok) throw new Error("Failed to add itinerary");

      setNewItinerary({ name: "", price: "" });
      setOpen(false);
      onItineraryAdded(); // ✅ Refresh the table
      toast.success("Itinerary added successfully!");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to add itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Itinerary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Itinerary Name"
            value={newItinerary.name}
            onChange={(e) => setNewItinerary({ ...newItinerary, name: e.target.value })}
          />
          <Input
            placeholder="Price (€)"
            type="number"
            value={newItinerary.price}
            onChange={(e) => setNewItinerary({ ...newItinerary, price: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              <XCircle className="mr-2" /> Cancel
            </Button>
            <Button onClick={handleAddItinerary} disabled={loading}>
              {loading ? "Saving..." : <><Check className="mr-2" /> Save</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
