import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import { authenticate, handleError } from '@/lib/api/middleware';
import User from '@/lib/mongoose/models/user.model';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    await connectToDatabase();

    const user = await User.findById(session.id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();

    await connectToDatabase();

    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update allowed fields
    if (body.firstName) user.firstName = body.firstName;
    if (body.lastName) user.lastName = body.lastName;
    if (body.phoneNumber) user.phoneNumber = body.phoneNumber;

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
