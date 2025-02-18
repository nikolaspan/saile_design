"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface Boat {
  id: number;
  name: string;
  type: string;
  length: number;
  capacity: number;
  hotel: string;
}

interface BoatsTableProps {
  boats: Boat[];
  title: string;
}

export default function BoatsTable({ boats, title }: BoatsTableProps) {
  const router = useRouter();

  const navigateToBoat = (id: number) => {
    router.push(`/dashboard/b2b/boats/${id}`);
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Table className="min-w-full table-fixed">
        <TableHeader>
          <TableRow>
            {/* Removed Hotel column */}
            <TableHead className="w-1/5">Boat Name</TableHead>
            <TableHead className="w-1/5">Boat Type</TableHead>
            <TableHead className="w-1/5">Length (ft)</TableHead>
            <TableHead className="w-1/5">Capacity</TableHead>
            <TableHead className="w-1/5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boats.map((boat) => (
            <TableRow
              key={boat.id}
              className="cursor-pointer "
              onClick={() => navigateToBoat(boat.id)}
            >
              <TableCell className="w-1/5">{boat.name}</TableCell>
              <TableCell className="w-1/5">{boat.type}</TableCell>
              <TableCell className="w-1/5">{boat.length}</TableCell>
              <TableCell className="w-1/5">{boat.capacity}</TableCell>
              <TableCell className="w-1/5">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
