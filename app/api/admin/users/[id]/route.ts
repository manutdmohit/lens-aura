import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase} from '@/lib/api/db';
import { authenticateAdmin, handleError } from '@/lib/api/middleware';
import User from '@/lib/mongoose/models/user.model';
import Order from '@/lib/mongoose/models/order.model';
import mongoose from 'mongoose';
import { z } from 'zod';

// Update user schema
const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['customer', 'admin', 'superadmin']).optional(),
  phoneNumber: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(params.id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's orders
    const orders = await Order.find({ user: params.id })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      user,
      orders,
    });
  } catch (error) {
    return handleError(error);
    } 
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    try {
      updateUserSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid user data' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent superadmin demotion by non-superadmin
    if (
      user.role === 'superadmin' &&
      body.role &&
      body.role !== 'superadmin' &&
      session.role !== 'superadmin'
    ) {
      return NextResponse.json(
        { error: 'Only superadmins can change the role of other superadmins' },
        { status: 403 }
      );
    }

    // Update user
    if (body.firstName) user.firstName = body.firstName;
    if (body.lastName) user.lastName = body.lastName;
    if (body.role) user.role = body.role;
    if (body.phoneNumber) user.phoneNumber = body.phoneNumber;

    await user.save();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    return handleError(error);
    } 
}

export async function DELETE(   
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent superadmin deletion by non-superadmin
    if (user.role === 'superadmin' && session.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only superadmins can delete superadmins' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if ((user._id as mongoose.Types.ObjectId).toString() === session.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    return handleError(error);
        } 
}
