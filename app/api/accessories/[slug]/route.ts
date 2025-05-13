import { NextRequest, NextResponse } from 'next/server';
import Accessory from '@/models/Accessory';
import { connectToDatabase } from '@/lib/api/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await connectToDatabase();

  try {
    const accessory = await Accessory.findOne({ slug: params.slug });
    
    if (!accessory) {
      return NextResponse.json(
        { error: 'Accessory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ accessory });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accessory' },
      { status: 500 }
    );
  }
} 