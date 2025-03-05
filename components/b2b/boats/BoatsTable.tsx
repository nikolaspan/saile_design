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
import { Trash2 } from "lucide-react";
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
  onDelete?: (boatId: string) => Promise<void>; // Made optional
}

const BoatsTable: React.FC<BoatsTableProps> = ({
  boats,
  title,
  onDelete = async () => {} // Default no‑op function
}) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingBoatId, setDeletingBoatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigateToBoat = (id: string) => {
    router.push(`/dashboard/b2b/boats/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, boatId: string) => {
    e.stopPropagation();
    console.log("Delete clicked for boat:", boatId);
    setDeletingBoatId(boatId);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBoatId) return;
    console.log("Confirm delete for boat:", deletingBoatId);
    setIsDeleting(true);
    try {
      await onDelete(deletingBoatId); // Call parent's delete handler
      setIsDialogOpen(false);
      setDeletingBoatId(null);
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error);
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
                    {isDeleting ? "Deleting..." : <Trash2 size={16} />}
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
              {isDeleting ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoatsTable;
