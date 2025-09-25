import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'listings.json');

async function readData() {
  const fileData = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(fileData);
}

async function writeData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const listings = await readData();
  const listing = listings.find((p: any) => p.id === params.id);
  if (listing) {
    return NextResponse.json(listing);
  }
  return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listings = await readData();
    const updatedListingData = await req.json();
    const index = listings.findIndex((p: any) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
    }

    listings[index] = { ...listings[index], ...updatedListingData };
    await writeData(listings);

    return NextResponse.json(listings[index]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating listing' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let listings = await readData();
    const index = listings.findIndex((p: any) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
    }

    listings.splice(index, 1);
    await writeData(listings);

    return NextResponse.json({ message: 'Listing deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting listing' }, { status: 500 });
  }
}
