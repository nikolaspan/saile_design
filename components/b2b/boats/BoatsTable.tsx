"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Delete icon
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define the Boat interface using the field names returned by your API.
export interface Boat {
  id: string;
  name: string;
  boatType: string;
  length: number | null;
  capacity: number | null;
  hotel: { name: string } | string;
  isForeign: boolean;
}

interface BoatsTableProps {
  boats: Boat[];
  title?: string;
  onDelete: (boatId: string) => Promise<void>; // Callback function to delete the boat
}

const BoatsTable: React.FC<BoatsTableProps> = ({ boats, title, onDelete }) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingBoatId, setDeletingBoatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigateToBoat = (id: string) => {
    router.push(`/dashboard/b2b/boats/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, boatId: string) => {
    e.stopPropagation(); // Prevent row click navigation
    setDeletingBoatId(boatId); // Set boat to be deleted
    setIsDialogOpen(true); // Open confirmation dialog
  };

  const handleConfirmDelete = async () => {
    if (!deletingBoatId) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingBoatId); // Call parent's delete handler
      setIsDialogOpen(false);
      setDeletingBoatId(null);
    } catch (error) {
      console.error("Error deleting boat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      <Table className="min-w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-gray-700">
            <TableHead className="w-1/5 p-2 text-left text-gray-800 dark:text-gray-200">
              Boat Name
            </TableHead>
            <TableHead className="w-1/5 p-2 text-left text-gray-800 dark:text-gray-200">
              Boat Type
            </TableHead>
            <TableHead className="w-1/5 p-2 text-left text-gray-800 dark:text-gray-200">
              Length (ft)
            </TableHead>
            <TableHead className="w-1/5 p-2 text-left text-gray-800 dark:text-gray-200">
              Capacity
            </TableHead>
            <TableHead className="w-1/5 p-2 text-left text-gray-800 dark:text-gray-200">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boats.map((boat) => (
            <TableRow
              key={boat.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => navigateToBoat(boat.id)}
            >
              <TableCell className="w-1/5 p-2 text-gray-700 dark:text-gray-300">
                {boat.name}
              </TableCell>
              <TableCell className="w-1/5 p-2 text-gray-700 dark:text-gray-300">
                {boat.boatType}
              </TableCell>
              <TableCell className="w-1/5 p-2 text-gray-700 dark:text-gray-300">
                {boat.length !== null ? boat.length : "N/A"}
              </TableCell>
              <TableCell className="w-1/5 p-2 text-gray-700 dark:text-gray-300">
                {boat.capacity !== null ? boat.capacity : "N/A"}
              </TableCell>
              <TableCell className="w-1/5 p-2">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToBoat(boat.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, boat.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "..." : <Trash2 size={16} />}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>Are you sure you want to delete this boat?</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoatsTable;
