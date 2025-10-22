import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'bookings.json');
const tempDataDir = path.join('/tmp');
const tempDataFilePath = path.join(tempDataDir, 'bookings.json');

async function ensureTempDirExists() {
  try {
    await fs.access(tempDataDir);
  } catch {
    await fs.mkdir(tempDataDir, { recursive: true });
  }
}

async function readData() {
    await ensureTempDirExists();
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

async function writeData(data) {
  await ensureTempDirExists();
  await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req, { params }) {
  const bookings = await readData();
  const booking = bookings.find((b) => b.id === params.id);
  if (booking) {
    return NextResponse.json(booking);
  }
  return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
}

export async function PUT(req, { params }) {
  try {
    const bookings = await readData();
    const updatedBookingData = await req.json();
    const index = bookings.findIndex((b) => b.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    bookings[index] = { ...bookings[index], ...updatedBookingData };
    await writeData(bookings);

    return NextResponse.json(bookings[index]);
  } catch (error) {
    console.error("API Error (PUT):", error);
    return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    let bookings = await readData();
    const index = bookings.findIndex((b) => b.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    bookings.splice(index, 1);
    await writeData(bookings);

    return NextResponse.json({ message: 'Booking deleted' }, { status: 200 });
  } catch (error) {
    console.error("API Error (DELETE):", error);
    return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
  }
}
