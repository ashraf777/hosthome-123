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
  } catch (error) {
    const originalData = await fs.readFile(dataFilePath, 'utf-8').then(JSON.parse);
    await fs.writeFile(tempDataFilePath, JSON.stringify(originalData, null, 2), 'utf-8');
    return originalData;
  }
}

async function writeData(data: any) {
  await ensureTempDirExists();
  await fs.writeFile(tempDataFilePath, JSON.stringify(data, null, 2), 'utf-8');
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
    console.error("API Error (POST):", error);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
