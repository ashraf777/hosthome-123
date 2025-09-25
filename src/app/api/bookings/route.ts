import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'bookings.json');

async function readData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [
        {
          id: "booking-001",
          guestName: "Olivia Martin",
          checkIn: new Date(2024, 6, 15).toISOString(),
          checkOut: new Date(2024, 6, 18).toISOString(),
          status: "Confirmed",
          total: 599.0,
          guestEmail: "olivia.martin@email.com",
          roomType: "Entire Place",
          unitListing: "unit101",
          bookingType: "nightly",
          bookingSource: "HostHome"
        },
        {
          id: "booking-002",
          guestName: "Jackson Lee",
          checkIn: new Date(2024, 6, 20).toISOString(),
          checkOut: new Date(2024, 6, 22).toISOString(),
          status: "Pending",
          total: 250.0,
          guestEmail: "jackson.lee@email.com",
          roomType: "Private Room",
          unitListing: "unit102",
          bookingType: "nightly",
          bookingSource: "Airbnb"
        },
      ];
    }
    throw error;
  }
}

async function writeData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const bookings = await readData();
    const newBooking = await req.json();
    
    newBooking.id = `booking-${Date.now()}`;
    
    bookings.push(newBooking);
    await writeData(bookings);
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: 'Error creating booking' }, { status: 500 });
  }
}
