import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readData() {
  const fileData = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(fileData);
}

async function writeData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const users = await readData();
  const user = users.find((u: any) => u.id === params.id);
  if (user) {
    return NextResponse.json(user);
  }
  return NextResponse.json({ message: 'User not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const users = await readData();
    const updatedUserData = await req.json();
    const index = users.findIndex((u: any) => u.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    users[index] = { ...users[index], ...updatedUserData };
    await writeData(users);

    return NextResponse.json(users[index]);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let users = await readData();
    const index = users.findIndex((u: any) => u.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    users.splice(index, 1);
    await writeData(users);

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
