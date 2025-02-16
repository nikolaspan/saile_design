"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Boat } from "./AddBoatDialog";

type BoatsTableProps = {
  boats: Boat[];
  title: string;
};

export default function BoatsTable({ boats, title }: BoatsTableProps) {
  const router = useRouter();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left px-4 py-2">Boat Name</TableHead>
              <TableHead className="text-left px-4 py-2">Type</TableHead>
              <TableHead className="text-right px-4 py-2">Length (ft)</TableHead>
              <TableHead className="text-right px-4 py-2">Capacity</TableHead>
              <TableHead className="text-center px-4 py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boats.map((boat) => (
              <TableRow key={boat.id}>
                <TableCell className="px-4 py-2">{boat.name}</TableCell>
                <TableCell className="px-4 py-2">{boat.type}</TableCell>
                <TableCell className="px-4 py-2 text-right">
                  {boat.length} ft
                </TableCell>
                <TableCell className="px-4 py-2 text-right">
                  {boat.capacity}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      sessionStorage.setItem("selectedBoatId", boat.id.toString());
                      router.push(`/dashboard/b2b/boats/${boat.id}`);
                    }}
                  >
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
