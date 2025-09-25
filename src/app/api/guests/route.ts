import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'guests.json');

async function readData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [
        {
          id: "guest-001",
          name: "Olivia Martin",
          email: "olivia.martin@email.com",
          avatar: "https://picsum.photos/seed/om/40/40",
          phone: "+1 (555) 123-4567",
          lastStay: new Date(2024, 6, 18).toISOString(),
          totalBookings: 3,
        },
        {
          id: "guest-002",
          name: "Jackson Lee",
          email: "jackson.lee@email.com",
          avatar: "https://picsum.photos/seed/jl/40/40",
          phone: "+1 (555) 987-6543",
          lastStay: new Date(2024, 6, 22).toISOString(),
          totalBookings: 1,
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
