import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'bookings.json');
const tempDataFilePath = path.join('/tmp', 'bookings.json');

async function readData() {
    try {
        await fs.access(tempDataFilePath);
        const fileData = await fs.readFile(tempDataFilePath, 'utf-8');
        return JSON.parse(fileData);
    } catch {
        const fileData = await fs.readFile(dataFilePath, 'utf-8');
        const data = JSON.parse(fileData);
        await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        return data;
    }
}

async function writeData(data: any) {
  await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const bookings = await readData();
  const booking = bookings.find((b: any) => b.id === params.id);
  if (booking) {
    return NextResponse.json(booking);
  }
  return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookings = await readData();
    const updatedBookingData = await req.json();
    const index = bookings.findIndex((b: any) => b.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    bookings[index] = { ...bookings[index], ...updatedBookingData };
    await writeData(bookings);

    return NextResponse.json(bookings[index]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let bookings = await readData();
    const index = bookings.findIndex((b: any) => b.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    bookings.splice(index, 1);
    await writeData(bookings);

    return NextResponse.json({ message: 'Booking deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
  }
}
