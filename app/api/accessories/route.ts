import { NextRequest, NextResponse } from 'next/server';
import Accessory from '@/models/Accessory';
import { connectToDatabase } from '@/lib/api/db';
export async function GET() {
    await connectToDatabase();

  try {
    const accessories = await Accessory.find().sort({ createdAt: -1 });

    console.log(accessories);
    return NextResponse.json({ accessories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accessories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const accessory = new Accessory(data);
    await accessory.save();
    return NextResponse.json({ accessory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create accessory' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...update } = await req.json();
    const accessory = await Accessory.findByIdAndUpdate(id, update, { new: true });
    if (!accessory) return NextResponse.json({ error: 'Accessory not found' }, { status: 404 });
    return NextResponse.json({ accessory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update accessory' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const accessory = await Accessory.findByIdAndDelete(id);
    if (!accessory) return NextResponse.json({ error: 'Accessory not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete accessory' }, { status: 500 });
  }
} 