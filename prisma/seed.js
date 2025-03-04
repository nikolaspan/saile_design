/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Array of boat types matching the BoatType enum in your schema.
const boatTypes = ["Catamaran", "RIB", "Speedboat", "Yacht", "Monohull"];

// BookingType enum values (as strings) for CharterItinerary.
const bookingTypes = ["FullDay", "HalfDay", "VipTransfer", "SunsetCruise"];

// Greek stops for generating CharterItinerary names.
const greekStops = ["Mykonos", "Santorini", "Paros", "Naxos", "Hydra", "Poros"];

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

  // 2️⃣ Upsert Hotels
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

  // 3️⃣ Create Users (2 admin, 2 concierge, 2 b2b)
  const passwordHash = await bcrypt.hash('password123', 10);
  const createUsers = async (role, count) =>
    Promise.all(
      Array.from({ length: count }, (_, i) =>
        prisma.user.upsert({
          where: { email: `${role}${i + 1}@example.com` },
          update: {},
          create: {
            name: `${role} User ${i + 1}`,
            email: `${role}${i + 1}@example.com`,
            passwordHash,
            role,
          },
        })
      )
    );

  const [adminUsers, conciergeUsers, b2bUsers] = await Promise.all([
    createUsers('admin', 2),
    createUsers('concierge', 2),
    createUsers('b2b', 2),
  ]);

  // 4️⃣ Create Concierge records using userId as primary key
  const concierges = await Promise.all(
    conciergeUsers.map((concierge, i) =>
      prisma.concierge.upsert({
        where: { userId: concierge.id },
        update: {},
        create: {
          userId: concierge.id,
          hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
        },
      })
    )
  );

  // 5️⃣ Create B2B records using userId as primary key
  const b2bs = await Promise.all(
    b2bUsers.map(user =>
      prisma.b2B.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, ezsailCommission: 3.00, vat: '20%' },
      })
    )
  );

  // 6️⃣ Upsert B2BHotel records linking each B2B to a hotel
  await Promise.all(
    b2bs.map((b2b, i) =>
      prisma.b2BHotel.upsert({
        where: { b2bId_hotelId: { b2bId: b2b.userId, hotelId: i % 2 === 0 ? hotel1.id : hotel2.id } },
        update: {},
        create: {
          b2bId: b2b.userId,
          hotelId: i % 2 === 0 ? hotel1.id : hotel2.id,
        },
      })
    )
  );

  // 7️⃣ Assign a random perk to every user
  const allUsers = [...adminUsers, ...conciergeUsers, ...b2bUsers];
  await Promise.all(
    allUsers.map(user => {
      const randomPerk = perks[Math.floor(Math.random() * perks.length)];
      return prisma.userPerkAssignment.create({
        data: {
          userId: user.id,
          perkId: randomPerk.id,
        },
      });
    })
  );

  // 8️⃣ Create Boats for each B2B: 3 domestic and 2 foreign per B2B
  let boats = [];
  for (const b2b of b2bs) {
    for (let i = 0; i < 3; i++) {
      const boat = await prisma.boat.create({
        data: {
          name: `Boat ${b2b.userId.slice(0, 4)} Domestic ${i + 1}`,
          b2bId: b2b.userId,
          hotelId: hotel1.id,
          isForeign: false,
          boatType: boatTypes[Math.floor(Math.random() * boatTypes.length)],
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
  await Promise.all(
    boats.map(boat =>
      prisma.skipper.create({
        data: {
          boatId: boat.id,
          name: `Skipper for ${boat.name}`,
          dateOfBirth: new Date(1980, 0, 1),
          licenseNumber: `LIC-${boat.id.slice(0, 6)}`,
        },
      })
    )
  );

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
  // Generate a random itinerary name using one or two stops.
  let charterItineraries = [];
  for (const boat of boats) {
    for (let i = 0; i < 2; i++) {
      // Decide randomly whether to use 1 or 2 stops.
      const numStops = Math.random() < 0.5 ? 1 : 2;
      const stops = [];
      while (stops.length < numStops) {
        const randomStop = greekStops[Math.floor(Math.random() * greekStops.length)];
        if (!stops.includes(randomStop)) stops.push(randomStop);
      }
      const itineraryName = stops.join(numStops === 1 ? "" : "-");
      
      const randomType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      const charterItinerary = await prisma.charterItinerary.create({
        data: {
          boatId: boat.id,
          name: itineraryName,
          type: randomType, // Set the booking type
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
      charterItineraries.push(charterItinerary);
    }
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

  // 1️⃣3️⃣ Create Bookings and add itineraries to bookings
  const bookingPromises = [];
  for (const concierge of concierges) {
    for (let i = 0; i < 10; i++) {
      const boat = boats[Math.floor(Math.random() * boats.length)];
      // Find a charter itinerary for this boat
      const charterItinerary = charterItineraries.find(ci => ci.boatId === boat.id);
      // Generate a unique bookingDateTime by adding a random offset
      const bookingDateTime = new Date();
      bookingDateTime.setDate(bookingDateTime.getDate() + Math.floor(Math.random() * 15) + 1);
      bookingDateTime.setMilliseconds(bookingDateTime.getMilliseconds() + Math.floor(Math.random() * 1000));

      const booking = await prisma.booking.create({
        data: {
          b2bId: boat.b2bId,
          boatId: boat.id,
          bookingDateTime,
          requiresApproval: boat.isForeign,
          conciergeId: concierge.userId,
          charterItineraryId: charterItinerary?.id ?? '',
          roomNumber: `Room ${Math.floor(Math.random() * 100) + 1}`,
        },
      });
      
      // Randomly assign 0-2 global itineraries to the booking
      const numItineraries = Math.floor(Math.random() * 3); // 0, 1, or 2
      let availableItineraries = [...globalItineraries];
      for (let j = 0; j < numItineraries; j++) {
        if (availableItineraries.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableItineraries.length);
        const selectedItinerary = availableItineraries.splice(randomIndex, 1)[0];
        bookingPromises.push(
          prisma.bookingItinerary.create({
            data: {
              bookingId: booking.id,
              itineraryId: selectedItinerary.id,
            },
          })
        );
      }
      
      // Create 2 passengers for this booking
      for (let j = 0; j < 2; j++) {
        await prisma.passenger.create({
          data: {
            bookingId: booking.id,
            fullName: `Passenger ${j + 1} for booking ${booking.id.slice(0,6)}`,
            dateOfBirth: new Date(1990, j, 1),
            idNumber: `ID-${booking.id.slice(0, 6)}-${j + 1}`,
            nationality: j % 2 === 0 ? 'CountryA' : 'CountryB',
          },
        });
      }
    }
  }
  await Promise.all(bookingPromises);

  console.log("✅ Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
