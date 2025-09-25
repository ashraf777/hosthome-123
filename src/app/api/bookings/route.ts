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
  } catch (error) {
    const originalData = await fs.readFile(dataFilePath, 'utf-8').then(JSON.parse);
    await fs.writeFile(tempDataFilePath, JSON.stringify(originalData, null, 2), 'utf-8');
    return originalData;
  }
}

async function writeData(data: any) {
  await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
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
