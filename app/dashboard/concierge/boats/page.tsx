'use client';

import { useState } from 'react';
import boatsData from "@/components/concierge/boats.json";
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import Link from 'next/link';

interface Boat {
  boatId: string;
  name: string;
}

const BoatsPage = () => {
  const role = "Concierge"; // Keep role if it's required for layout rendering

  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // Filter boats based on the search term
  const filteredBoats = boatsData.boats.filter((boat: Boat) =>
    boat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role={role}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Boat Listings</h1>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search boats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full" // Add some margin and full width
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoats.map((boat) => (
            <Card key={boat.boatId}>
              <Link href={`/dashboard/concierge/boats/${boat.boatId}`} className="block">
                <CardHeader>
                  <CardTitle>{boat.name}</CardTitle>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button>Learn More</Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BoatsPage;
