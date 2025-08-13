import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import {
  authenticate,
  authenticateAdmin,
  handleError,
} from '@/lib/api/middleware';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { z } from 'zod';

// Update order status schema
const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
});

export async function GET(req: NextRequest, context: any) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const { id } = await context.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized to view this order
    if (
      order.user?.toString() !== session.id &&
      session.role !== 'admin' &&
      session.role !== 'superadmin'
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const { id } = await context.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    try {
      updateOrderStatusSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    order.status = body.status;

    // If cancelled or refunded, update payment status
    if (body.status === 'cancelled') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    return NextResponse.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    return handleError(error);
  }
}
