import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readData() {
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [
        {
          id: "user-001",
          name: "Admin User",
          email: "admin@hosthome.com",
          avatar: "https://picsum.photos/seed/hosthome-user/40/40",
          role: "Admin",
          status: "Active",
        },
        {
          id: "user-002",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          avatar: "https://picsum.photos/seed/js/40/40",
          role: "Staff",
          status: "Active",
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
    const users = await readData();
    const newUser = await req.json();
    
    newUser.id = `user-${Date.now()}`;
    
    users.push(newUser);
    await writeData(users);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
