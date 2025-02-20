'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import boatsData from '@/components/concierge/boats.json';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BoatData {
  boatId: string;
  name: string;
  destinations: string[];
  prices: { [destination: string]: { [tripType: string]: number } | undefined };
  capacity: number;
  notAvailableDates: string[];
  tripTypes: string[];
  itinerary: { name: string; price: number }[];
}

const BoatDetailsPage = () => {
  const { id } = useParams();
  const [boat, setBoat] = useState<BoatData | null>(null);

  useEffect(() => {
    if (id) {
      const foundBoat = boatsData.boats.find((b: BoatData) => b.boatId === id);
      setBoat(foundBoat || null);
    }
  }, [id]);

  if (!boat) {
    return (
      <DashboardLayout role="Concierge">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Boat Not Found</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Concierge">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{boat.name} – Pricelist & Itinerary</h1>
        
        {/* Pricelist Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Pricelist</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Trip Type</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(boat.prices).map(([destination, tripPrices]) =>
                  tripPrices
                    ? Object.entries(tripPrices).map(([tripType, price]) => (
                        <TableRow key={`${destination}-${tripType}`}>
                          <TableCell>{destination}</TableCell>
                          <TableCell>{tripType}</TableCell>
                          <TableCell>${price}</TableCell>
                        </TableRow>
                      ))
                    : null
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Itinerary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {boat.itinerary.map((item) => (
                <li key={item.name} className="mb-2">
                  <span className="font-semibold">{item.name}:</span> ${item.price}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BoatDetailsPage;
