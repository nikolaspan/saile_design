import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, XCircle } from "lucide-react";
import { toast } from "sonner"; 

interface AddItineraryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  boatId: string; 
  onItineraryAdded: () => void; 
}

export default function AddItineraryDialog({ open, setOpen, boatId, onItineraryAdded }: AddItineraryDialogProps) {
  const [newItinerary, setNewItinerary] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  const handleAddItinerary = async () => {
    if (!newItinerary.name || !newItinerary.price || isNaN(parseFloat(newItinerary.price))) {
      toast.error("Please enter valid values for both name and price.");
      return;
    }
  
    setLoading(true);
    try {
      // Convert price to float before sending it
      const response = await fetch(`/api/b2b/boats/${boatId}/itineraries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: boatId,
          name: newItinerary.name,
          price: parseFloat(newItinerary.price),  // Ensure it's a valid number
        }),
      });
  
      if (!response.ok) throw new Error("Failed to add itinerary");
  
      setNewItinerary({ name: "", price: "" });
      setOpen(false);
      onItineraryAdded();
      toast.success("Itinerary added successfully!");
    } catch (error) {
      toast.error("Failed to add itinerary. Please try again.");
      console.error("Error adding itinerary:", error);  // Log the error for debugging
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
