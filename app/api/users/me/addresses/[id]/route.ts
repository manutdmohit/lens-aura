import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import {
  authenticate,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { addressSchema } from '@/lib/api/validation';
import User from '@/lib/mongoose/models/user.model';

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
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

    // Find the address to update
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === id
    );
    s;

    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If this is a default address, unset any existing default of the same type
    if (data.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr.type === data.type && addr._id.toString() !== id) {
          addr.isDefault = false;
        }
      });
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...data,
      _id: user.addresses[addressIndex]._id, // Preserve the original ID
    };

    await user.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    await connectToDatabase();

    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the address to delete
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    await user.save();

    return NextResponse.json({
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
