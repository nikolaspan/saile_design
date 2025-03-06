"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import TripsCalendar from "@/components/boats/TripsCalendar";
import CompletedTripsTable from "@/components/boats/CompletedTripsTable";
import PriceListTable, { PriceItem } from "@/components/boats/PriceListTable";
import ItineraryTable from "@/components/boats/ItineraryTable";
import AddItineraryDialog from "@/components/boats/AddItineraryDialog";
import AddPriceDialog from "@/components/boats/AddPriceDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Define the missing types directly in this file
export type Trip = {
  id: string;
  date: string;
  charterType: string;
  itineraryName: string;
  revenue: number;
  status?: string;
};

export type Itinerary = {
  id: string;
  name: string;
  price: number;
};

export type PriceItemFromAPI = {
  id: string;
  name: string;
  netBoatRentalWithoutCommission: string;
  commission: string;
  netBoatRentalWithoutVAT: string;
  vat: string;
  boatRentalDay: string;
  fuelCost: string;
  priceVATAndFuelIncluded: string;
  ezsailSeaServicesCommission: string;
  finalPrice: string;
  type: string;
};

export type BoatData = {
  name: string;
  itineraries: Itinerary[];
  bookings: Trip[];
  priceList: PriceItem[];
  charterItineraries?: PriceItemFromAPI[];
  ezSailCommission: number | string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ITEMS_PER_PAGE = 5;

export default function BoatPage() {
  const { id } = useParams();  // Dynamically fetch the boat's ID from the URL
  const [isItineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  const [isPriceDialogOpen, setPriceDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: boatData, error, isLoading, mutate } = useSWR<BoatData>(
    id ? `/api/b2b/boats/${id}` : null,  // Fetch boat data using dynamic id
    fetcher,
    { revalidateOnFocus: false }
  );

  // Loading state when data is still being fetched
  if (isLoading) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
      </DashboardLayout>
    );
  }

  // If an error occurs or no boat data is found
  if (error || !boatData) {
    return (
      <DashboardLayout role="B2B">
        <div className="p-6">
          <p className="text-red-500">{error?.message || "Boat data not found"}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { name, itineraries = [], bookings = [] } = boatData;
  const ezsailCommission = Number(boatData?.ezSailCommission) || NaN;

  const priceList: PriceItem[] =
    boatData.priceList && boatData.priceList.length > 0
      ? boatData.priceList.map((item) => ({
          id: item.id,
          name: item.name,
          type: "FullDay", // Defaulting; modify if API returns a valid type
          netBoatRentalWithoutCommission: Number(item.netBoatRentalWithoutCommission) || 0,
          commission: Number(item.commission) || 0,
          netBoatRentalWithoutVAT: Number(item.netBoatRentalWithoutVAT) || 0,
          vat: Number(item.vat) || 0,
          boatRentalDay: Number(item.boatRentalDay) || 0,
          fuelCost: Number(item.fuelCost) || 0,
          priceVATAndFuelIncluded: Number(item.priceVATAndFuelIncluded) || 0,
          ezsailSeaServicesCommission: Number(item.ezsailSeaServicesCommission) || 0,
          finalPrice: Number(item.finalPrice) || 0,
        }))
      : boatData.charterItineraries
      ? boatData.charterItineraries.map((it) => ({
          id: it.id,
          name: it.name,
          type: it.type,
          netBoatRentalWithoutCommission: Number(it.netBoatRentalWithoutCommission) || 0,
          commission: Number(it.commission) || 0,
          netBoatRentalWithoutVAT: Number(it.netBoatRentalWithoutVAT) || 0,
          vat: Number(it.vat) || 0,
          boatRentalDay: Number(it.boatRentalDay) || 0,
          fuelCost: Number(it.fuelCost) || 0,
          priceVATAndFuelIncluded: Number(it.priceVATAndFuelIncluded) || 0,
          ezsailSeaServicesCommission: Number(it.ezsailSeaServicesCommission) || 0,
          finalPrice: Number(it.finalPrice) || 0,
        }))
      : [];

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedTrips = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteItinerary = async (itineraryId: string) => {
    try {
      const res = await fetch(`/api/b2b/boats/${id}/itineraries/${itineraryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete itinerary");
      }

      toast.success("Itinerary deleted successfully");
      await mutate(); // Revalidate data after deletion
    } catch (error) {
      toast.error(
        "Error deleting itinerary: " + (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <DashboardLayout role="B2B">
      <div className="p-6 space-y-8 mt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{name} - Manage Boats</h1>
          <div className="flex gap-4">
            <Button onClick={() => setItineraryDialogOpen(true)}>
              <PlusCircle className="mr-2" /> Add Itinerary
            </Button>
            <Button onClick={() => setPriceDialogOpen(true)}>
              <PlusCircle className="mr-2" /> Add Charter Itinerary
            </Button>
          </div>
        </div>

        <TripsCalendar trips={bookings} />

        <CompletedTripsTable
          trips={paginatedTrips}
          onBookingCancelled={async () => {
            await mutate();
          }}
        />

        <div className="flex justify-between items-center">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <p>
            Page {currentPage} of {totalPages || 1}
          </p>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>

        <PriceListTable priceList={priceList} />

        <ItineraryTable itineraries={itineraries} onDelete={handleDeleteItinerary} />

        <AddItineraryDialog
          open={isItineraryDialogOpen}
          setOpen={setItineraryDialogOpen}
          boatId={id as string}
          onItineraryAdded={async () => {
            await mutate();
          }}
        />

        <AddPriceDialog
          open={isPriceDialogOpen}
          setOpen={setPriceDialogOpen}
          boatId={id as string}
          ezsailCommissionPercentage={ezsailCommission}
          previousItineraries={
            boatData.charterItineraries
              ? boatData.charterItineraries.map((it) => it.name)
              : []
          }
          onPriceAdded={async () => {
            await mutate();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
