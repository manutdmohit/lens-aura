import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import {
  authenticate,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { createOrderSchema } from '@/lib/api/validation';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get user's orders
    const orders = await Order.find({ user: session.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments({ user: session.id });

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();
    const { data, error } = validateRequest(createOrderSchema, body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify products and calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    let shippingCost = 0;

    // Set shipping cost based on method
    switch (data.shippingMethod) {
      case 'express':
        shippingCost = 15;
        break;
      case 'overnight':
        shippingCost = 25;
        break;
      default: // standard
        shippingCost = 5;
    }

    // Verify each product and calculate subtotal
    for (const item of data.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }

      if (!product.inStock || (product.stockQuantity ?? 0) < item.quantity) {
        return NextResponse.json(
          {
            error: `Product ${product.name} is out of stock or has insufficient quantity`,
          },
          { status: 400 }
        );
      }

      // Add to subtotal
      subtotal += product.price * item.quantity;

      // Update product stock
      product.stockQuantity = (product.stockQuantity ?? 0) - item.quantity;
      await product.save();
    }

    // Calculate tax (assuming 8%)
    taxAmount = subtotal * 0.08;

    // Calculate total
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Create order
    const order = new Order({
      user: session.id,
      items: data.items,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod,
      shippingAddress: data.shippingAddress,
      shippingMethod: data.shippingMethod,
      shippingCost,
      taxAmount,
      discountCode: data.discountCode,
      discountAmount: 0, // Would calculate based on discount code
    });

    await order.save();

    // Add order to user's orders
    user.orders.push(order._id as mongoose.Schema.Types.ObjectId);
    await user.save();

    // Clear user's cart - cart is handled separately in the cart context
    // The cart will be cleared on the frontend after successful order

    return NextResponse.json(
      { message: 'Order created successfully', order },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
