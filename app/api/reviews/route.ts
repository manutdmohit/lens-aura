import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import {
  authenticateAdmin,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import {
  baseProductSchema,
  glassesSchema,
  sunglassesSchema,
  contactLensesSchema,
} from '@/lib/api/validation';
import Product from '@/lib/mongoose/models/product.model';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate based on product type
    let validationResult;

    switch (body.productType) {
      case 'Glasses':
        validationResult = validateRequest(glassesSchema, body);
        break;
      case 'Sunglasses':
        validationResult = validateRequest(sunglassesSchema, body);
        break;
      case 'ContactLenses':
        validationResult = validateRequest(contactLensesSchema, body);
        break;
      default:
        validationResult = validateRequest(baseProductSchema, body);
    }

    const { data, error } = validationResult;

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await connectToDatabase();

    // Find and update the product
    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
