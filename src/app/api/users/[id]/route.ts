import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
const tempDataDir = path.join('/tmp');
const tempDataFilePath = path.join(tempDataDir, 'users.json');

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

async function writeData(data: any) {
  await ensureTempDirExists();
  await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
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
    console.error("API Error (PUT):", error);
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
    console.error("API Error (DELETE):", error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
