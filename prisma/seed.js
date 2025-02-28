/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Array of boat types matching the BoatType enum in your schema.
const boatTypes = ["Catamaran", "RIB", "Speedboat", "Yacht", "Monohull"];

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Upsert some perks
  const perkNames = ['Free Drink', 'VIP Lounge', 'Priority Booking'];
  const perks = await Promise.all(
    perkNames.map(name =>
      prisma.userPerk.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // 2️⃣ Upsert Hotels (make sure hotel name is unique in your schema)
  const hotel1 = await prisma.hotel.upsert({
    where: { name: 'Grand Hotel' },
    update: {},
    create: { name: 'Grand Hotel', location: 'City Center' },
  });
  const hotel2 = await prisma.hotel.upsert({
    where: { name: 'Seaside Resort' },
    update: {},
    create: { name: 'Seaside Resort', location: 'Beachside' },
  });

  // 3️⃣ Create Users (2 admin, 2 concierge, 2 b2b) using upsert to avoid duplicates
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUsers = [];
  const conciergeUsers = [];
  const b2bUsers = [];

  for (let i = 0; i < 2; i++) {
    const admin = await prisma.user.upsert({
      where: { email: `admin${i + 1}@example.com` },
      update: {},
      create: {
        name: `Admin User ${i + 1}`,
        email: `admin${i + 1}@example.com`,
        passwordHash,
        role: 'admin',
      },
    });
    adminUsers.push(admin);
  }
  for (let i = 0; i < 2; i++) {
    const conciergeUser = await prisma.user.upsert({
      where: { email: `concierge${i + 1}@example.com` },
      update: {},
      create: {
        name: `Concierge User ${i + 1}`,
        email: `concierge${i + 1}@example.com`,
        passwordHash,
        role: 'concierge',
      },
    });
    conciergeUsers.push(conciergeUser);
  }
  for (let i = 0; i < 2; i++) {
    const b2bUser = await prisma.user.upsert({
      where: { email: `b2b${i + 1}@example.com` },
      update: {},
      create: {
        name: `B2B User ${i + 1}`,
        email: `b2b${i + 1}@example.com`,
        passwordHash,
        role: 'b2b',
      },
    });
    b2bUsers.push(b2bUser);
  }

  // 4️⃣ Create Concierge records using userId as primary key
  const concierges = [];
  for (let i = 0; i < conciergeUsers.length; i++) {
    const concierge = await prisma.concierge.upsert({
      where: { userId: conciergeUsers[i].id },
      update: {},
      create: {
        userId: conciergeUsers[i].id,
        hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
      },
    });
    concierges.push(concierge);
  }

  // 5️⃣ Create B2B records using userId as primary key
  const b2bs = [];
  for (let i = 0; i < b2bUsers.length; i++) {
    const b2b = await prisma.b2B.upsert({
      where: { userId: b2bUsers[i].id },
      update: {},
      create: {
        userId: b2bUsers[i].id,
        ezsailCommission: 3.00,
        vat: '20%',
      },
    });
    b2bs.push(b2b);
  }

  // 6️⃣ Upsert B2BHotel records linking each B2B to a hotel
  for (let i = 0; i < b2bs.length; i++) {
    await prisma.b2BHotel.upsert({
      where: { b2bId_hotelId: { b2bId: b2bs[i].userId, hotelId: i % 2 === 0 ? hotel1.id : hotel2.id } },
      update: {},
      create: {
        b2bId: b2bs[i].userId,
        hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
      },
    });
  }

  // 7️⃣ Assign a random perk to every user (admin, concierge, b2b)
  const allUsers = [...adminUsers, ...conciergeUsers, ...b2bUsers];
  for (const user of allUsers) {
    const randomPerk = perks[Math.floor(Math.random() * perks.length)];
    await prisma.userPerkAssignment.create({
      data: {
        userId: user.id,
        perkId: randomPerk.id,
      },
    });
  }

  // 8️⃣ Create Boats for each B2B: 3 domestic and 2 foreign per B2B
  const boats = [];
  for (const b2b of b2bs) {
    for (let i = 0; i < 3; i++) {
      const boat = await prisma.boat.create({
        data: {
          name: `Boat ${b2b.userId.slice(0, 4)} Domestic ${i + 1}`,
          b2bId: b2b.userId,
          hotelId: hotel1.id,
          isForeign: false,
          boatType: boatTypes[Math.floor(Math.random() * boatTypes.length)],
          // Random length between 10.00 and 50.00
          length: Number((Math.random() * 40 + 10).toFixed(2)),
        },
      });
      boats.push(boat);
    }
    for (let i = 0; i < 2; i++) {
      const boat = await prisma.boat.create({
        data: {
          name: `Boat ${b2b.userId.slice(0, 4)} Foreign ${i + 1}`,
          b2bId: b2b.userId,
          hotelId: hotel2.id,
          isForeign: true,
          boatType: boatTypes[Math.floor(Math.random() * boatTypes.length)],
          length: Number((Math.random() * 40 + 10).toFixed(2)),
        },
      });
      boats.push(boat);
    }
  }

  // 9️⃣ Create Skipper records for each boat
  for (const boat of boats) {
    await prisma.skipper.create({
      data: {
        boatId: boat.id,
        name: `Skipper for ${boat.name}`,
        dateOfBirth: new Date(1980, 0, 1),
        licenseNumber: `LIC-${boat.id.slice(0, 6)}`,
      },
    });
  }

  // 🔟 Create Boat Unavailability entries for each boat (2 entries per boat)
  for (const boat of boats) {
    for (let i = 0; i < 2; i++) {
      const unavailableDate = new Date();
      unavailableDate.setDate(unavailableDate.getDate() + i + 1);
      await prisma.boatUnavailability.create({
        data: {
          boatId: boat.id,
          unavailableDate,
          reason: `Maintenance ${i + 1}`,
        },
      });
    }
  }

  // 1️⃣1️⃣ Create CharterItinerary records for each boat (2 per boat)
  // For the charter itinerary name, we generate Greek-stop names.
  const greekStops = ["Mykonos", "Santorini", "Poros", "Hydra"];
  const boatCharterItineraries = {}; // mapping boatId => array of CharterItinerary records
  for (const boat of boats) {
    const itinerariesForBoat = [];
    for (let i = 0; i < 2; i++) {
      // Randomly decide on one or two stops
      const numStops = Math.random() < 0.5 ? 1 : 2;
      const chosenStops = [];
      while (chosenStops.length < numStops) {
        const stop = greekStops[Math.floor(Math.random() * greekStops.length)];
        if (!chosenStops.includes(stop)) {
          chosenStops.push(stop);
        }
      }
      const charterName = chosenStops.join("-");

      const charterItinerary = await prisma.charterItinerary.create({
        data: {
          boatId: boat.id,
          name: charterName, // e.g. "Mykonos" or "Mykonos-Santorini"
          netBoatRentalWithoutCommission: 1000.00,
          commission: 100.00,
          netBoatRentalWithoutVAT: 900.00,
          vat: 216.00,
          boatRentalDay: 1116.00,
          fuelCost: 150.00,
          priceVATAndFuelIncluded: 1266.00,
          ezsailSeaServicesCommission: 27.00,
          finalPrice: 1293.00,
        },
      });
      itinerariesForBoat.push(charterItinerary);
    }
    boatCharterItineraries[boat.id] = itinerariesForBoat;
  }

  // 1️⃣2️⃣ Create global Itinerary records (for booking selection)
  const itineraryNames = ["Island Tour", "City Cruise", "Snorkeling", "Sunset Dinner"];
  const globalItineraries = [];
  for (const name of itineraryNames) {
    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        price: Math.floor(Math.random() * 500) + 100,
      },
    });
    globalItineraries.push(itinerary);
  }

  // Optional: Connect each boat to all global itineraries
  for (const boat of boats) {
    await prisma.boat.update({
      where: { id: boat.id },
      data: {
        itineraries: {
          connect: globalItineraries.map((itinerary) => ({ id: itinerary.id })),
        },
      },
    });
  }

  // 1️⃣3️⃣ Create Bookings
  const bookingTypes = ['FullDay', 'HalfDay', 'VipTransfer', 'SunsetCruise'];
  let bookingCount = 0;
  for (const concierge of concierges) {
    for (let i = 0; i < 15; i++) {
      const boat = boats[Math.floor(Math.random() * boats.length)];
      const b2bId = boat.b2bId;
      const bookingDateTime = new Date();
      bookingDateTime.setDate(bookingDateTime.getDate() + i + 1);
      const type = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      const requiresApproval = boat.isForeign;

      // Generate a random room number between 1 and 100.
      const roomNumber = `Room ${Math.floor(Math.random() * 100) + 1}`;

      // Randomly select one CharterItinerary for this boat
      const availableCharterItineraries = boatCharterItineraries[boat.id];
      const chosenCharterItinerary = availableCharterItineraries[Math.floor(Math.random() * availableCharterItineraries.length)];

      try {
        const booking = await prisma.booking.create({
          data: {
            b2bId,
            boatId: boat.id,
            bookingDateTime,
            type,
            requiresApproval,
            conciergeId: concierge.userId,
            charterItineraryId: chosenCharterItinerary.id,
            roomNumber,
          },
        });
        bookingCount++;

        // Randomly select 0 to 2 global itineraries for this booking
        const numItineraries = Math.floor(Math.random() * 3);
        const selectedItineraries = [];
        const itinerariesCopy = [...globalItineraries];
        for (let j = 0; j < numItineraries; j++) {
          if (itinerariesCopy.length === 0) break;
          const index = Math.floor(Math.random() * itinerariesCopy.length);
          selectedItineraries.push(itinerariesCopy.splice(index, 1)[0]);
        }
        for (const itinerary of selectedItineraries) {
          await prisma.bookingItinerary.create({
            data: {
              bookingId: booking.id,
              itineraryId: itinerary.id,
            },
          });
        }

        // Create 2 passengers per booking
        for (let j = 0; j < 2; j++) {
          await prisma.passenger.create({
            data: {
              bookingId: booking.id,
              fullName: `Passenger ${j + 1} for booking ${bookingCount}`,
              dateOfBirth: new Date(1990, j, 1),
              idNumber: `ID-${booking.id.slice(0, 6)}-${j + 1}`,
              nationality: j % 2 === 0 ? 'CountryA' : 'CountryB',
            },
          });
        }
      } catch (e) {
        console.error(
          `Error creating booking for concierge ${concierge.userId} on day ${i + 1}: `,
          e
        );
      }
    }
  }

  console.log("🌱 Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
