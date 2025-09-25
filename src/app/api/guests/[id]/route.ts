import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'guests.json');

async function readData() {
  const fileData = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(fileData);
}

async function writeData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guests = await readData();
  const guest = guests.find((g: any) => g.id === params.id);
  if (guest) {
    return NextResponse.json(guest);
  }
  return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guests = await readData();
    const updatedGuestData = await req.json();
    const index = guests.findIndex((g: any) => g.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 444 });
    }

    guests[index] = { ...guests[index], ...updatedGuestData };
    await writeData(guests);

    return NextResponse.json(guests[index]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating guest' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let guests = await readData();
    const index = guests.findIndex((g: any) => g.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Guest not found' }, { status: 404 });
    }

    guests.splice(index, 1);
    await writeData(guests);

    return NextResponse.json({ message: 'Guest deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting guest' }, { status: 500 });
  }
}
