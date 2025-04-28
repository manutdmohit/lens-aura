import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import {
  authenticate,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { addressSchema } from '@/lib/api/validation';
import User from '@/lib/mongoose/models/user.model';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    await connectToDatabase();

    const user = await User.findById(session.id).select('addresses');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ addresses: user.addresses });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();
    const { data, error } = validateRequest(addressSchema, body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If this is a default address, unset any existing default of the same type
    if (data.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === data.type) {
          addr.isDefault = false;
        }
      });
    }

    // Add the new address
    user.addresses.push({ ...data, isDefault: data.isDefault ?? false });

    await user.save();

    return NextResponse.json(
      { message: 'Address added successfully', addresses: user.addresses },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
