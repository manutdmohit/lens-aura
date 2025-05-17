import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase} from '@/lib/api/db';
import { handleError } from '@/lib/api/middleware';
import User from '@/models/User';
import type { IUser } from '@/models/index';
import { getSessionUser, isAdmin } from '@/utils/getSessionUser';

// Type for the request body using the imported IUser type
type CreateUserRequest = Pick<
  IUser,
  'firstName' | 'lastName' | 'email' | 'password' | 'role' | 'phoneNumber'
>;

export async function POST(req: NextRequest) {
  try {
    // Get the current session user and verify admin role
    const sessionUser = await getSessionUser({ required: true });

    if (!sessionUser || !isAdmin(sessionUser)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await req.json()) as CreateUserRequest;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password, // Will be hashed by pre-save hook
      role: body.role,
      phoneNumber: body.phoneNumber,
    });

    await newUser.save();

    // Return success response (excluding password)
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  } 
}
