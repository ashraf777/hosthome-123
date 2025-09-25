import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'guests.json');
const tempDataFilePath = path.join('/tmp', 'guests.json');

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
    const guests = await readData();
    const newGuest = await req.json();
    
    newGuest.id = `guest-${Date.now()}`;
    newGuest.lastStay = new Date().toISOString();
    newGuest.totalBookings = 1;
    
    guests.push(newGuest);
    await writeData(guests);
    
    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating guest' }, { status: 500 });
  }
}
