import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import {
  authenticate,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import User from '@/lib/mongoose/models/user.model';
import Product from '@/lib/mongoose/models/product.model';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';

// Cart item validation schema
const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  color: z.string().optional(),
});

// Cart validation schema
const cartSchema = z.object({
  items: z.array(cartItemSchema),
});

// Helper function to get cart from session
async function getCart(req: NextRequest) {
  const session = await authenticate(req);

  if (session instanceof NextResponse) {
    return { error: session };
  }

  return { userId: session.id };
}

export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await getCart(req);

    if (error) {
      return error;
    }

    await connectToDatabase();

    // Get user's cart items
    const user = await User.findById(userId).select('cart');

    if (!user || !user.cart || !Array.isArray(user.cart.items)) {
      return NextResponse.json({ items: [] });
    }

    // Get product details for cart items
    const cartWithProducts = await Promise.all(
      user.cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          productId: item.product.toString(),
          quantity: item.quantity,
          color: item.color,
          product: product
            ? {
                id: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                productType: product.productType,
              }
            : null,
        };
      })
    );

    // Filter out items with deleted products
    const validCartItems = cartWithProducts.filter(
      (item) => item.product !== null
    );

    return NextResponse.json({ items: validCartItems });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await getCart(req);

    if (error) {
      return error;
    }

    const body = await req.json();
    const { data, error: validationError } = validateRequest(
      cartItemSchema,
      body
    );

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await connectToDatabase();

    // Verify product exists
    const product = await Product.findById(data.productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is in stock
    if (!product.inStock || product.stockQuantity < data.quantity) {
      return NextResponse.json(
        { error: 'Product is out of stock or insufficient quantity' },
        { status: 400 }
      );
    }

    // Get user and update cart
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = { items: [] };
    }

    // Check if product already in cart
    const existingItemIndex = user.cart.items.findIndex(
      (item) =>
        item.product.toString() === data.productId &&
        (item.color === data.color || (!item.color && !data.color))
    );

    if (existingItemIndex !== -1) {
      // Update quantity if already in cart
      user.cart.items[existingItemIndex].quantity += data.quantity;
    } else {
      // Add new item to cart
      user.cart.items.push({
        product: new mongoose.Types.ObjectId(data.productId),
        quantity: data.quantity,
        color: data.color,
      });
    }

    await user.save();

    return NextResponse.json(
      { message: 'Item added to cart', cart: user.cart },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, error } = await getCart(req);

    if (error) {
      return error;
    }

    const body = await req.json();
    const { data, error: validationError } = validateRequest(cartSchema, body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Replace entire cart
    user.cart = {
      items: data.items.map((item) => ({
        product: new mongoose.Types.ObjectId(
          item.productId
        ) as unknown as mongoose.Schema.Types.ObjectId,
        quantity: item.quantity,
        color: item.color,
      })),
    };

    await user.save();

    return NextResponse.json({
      message: 'Cart updated successfully',
      cart: user.cart,
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, error } = await getCart(req);

    if (error) {
      return error;
    }

    await connectToDatabase();

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clear cart
    user.cart = { items: [] };
    await user.save();

    return NextResponse.json({
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
