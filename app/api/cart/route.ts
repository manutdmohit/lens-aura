import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import { handleError } from '@/lib/api/middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import Cart from '@/models/Cart';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.product')
      .lean();

    return NextResponse.json({ cart: cart || { items: [] } });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    return NextResponse.json({ cart }, { status: 201 });
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
