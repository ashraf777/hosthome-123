import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'listings.json');

async function readData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    // If the file doesn't exist, return initial data
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [
        {
          id: "prop-001",
          name: "Cozy Downtown Apartment",
          imageUrl: "https://picsum.photos/seed/prop1/800/600",
          imageHint: "apartment interior",
          roomType: "Entire Place",
          status: "Listed",
          instantBook: true,
          price: 150,
          description: "A lovely apartment in the heart of the city.",
          address: "123 Main St, Anytown, USA",
          amenities: "Wi-Fi, Kitchen, Free Parking"
        },
        {
          id: "prop-002",
          name: "Beachside Villa",
          imageUrl: "https://picsum.photos/seed/prop2/800/600",
          imageHint: "beach villa",
          roomType: "Entire Place",
          status: "Listed",
          instantBook: false,
          price: 450,
          description: "Stunning villa with ocean views.",
          address: "456 Ocean Ave, Beachtown, USA",
          amenities: "Wi-Fi, Pool, Air Conditioning"
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
    const listings = await readData();
    const newListing = await req.json();
    
    newListing.id = `prop-${Date.now()}`;
    
    listings.push(newListing);
    await writeData(listings);
    
    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating listing' }, { status: 500 });
  }
}
