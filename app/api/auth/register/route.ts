import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import { validateRequest, handleError } from '@/lib/api/middleware';
import { registerUserSchema } from '@/lib/api/validation';
import User from '@/lib/mongoose/models/user.model';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Validate request body
    const body = await req.json();
    const { data, error } = validateRequest(registerUserSchema, body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      email: data.email,
      password: data.password, // Will be hashed by pre-save hook
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    });

    await user.save();

    // Return success response (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
