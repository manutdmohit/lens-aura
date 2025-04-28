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
import Glasses from '@/lib/mongoose/models/glasses.model';
import Sunglasses from '@/lib/mongoose/models/sunglasses.model';
import ContactLenses from '@/lib/mongoose/models/contact-lenses-model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const category = searchParams.get('category');
    const productType = searchParams.get('productType');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (productType) {
      query.productType = productType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();

    // Validate based on product type
    let validationResult;
    let ProductModel;

    switch (body.productType) {
      case 'Glasses':
        validationResult = validateRequest(glassesSchema, body);
        ProductModel = Glasses;
        break;
      case 'Sunglasses':
        validationResult = validateRequest(sunglassesSchema, body);
        ProductModel = Sunglasses;
        break;
      case 'ContactLenses':
        validationResult = validateRequest(contactLensesSchema, body);
        ProductModel = ContactLenses;
        break;
      default:
        validationResult = validateRequest(baseProductSchema, body);
        ProductModel = Product;
    }

    const { data, error } = validationResult;

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await connectToDatabase();

    // Create the product
    const product = new ProductModel(data);
    await product.save();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
