import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions'; // adjust path if different
import { connectToDatabase } from '@/lib/api/db';
// import {
//   authenticateAdmin,
//   validateRequest,
//   handleError,
// } from '@/lib/api/middleware';
// import {
//   baseProductSchema,
//   glassesSchema,
//   sunglassesSchema,
//   contactLensesSchema,
// } from '@/lib/api/validation';
// import Product from '@/lib/mongoose/models/product.model';
// import Glasses from '@/lib/mongoose/models/glasses.model';
// import Sunglasses from '@/lib/mongoose/models/sunglasses.model';
// import ContactLenses from '@/lib/mongoose/models/contact-lenses-model';
import { Product } from '@/models';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
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
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  } 
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // const session = await authenticateAdmin(req);

    // if (session instanceof NextResponse) {
    //   return session; // This is an error response
    // }

    const body = await req.json();
    let { imageUrl, ...rest } = body;

    await connectToDatabase();

    // If imageUrl is base64, upload to Cloudinary
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(imageUrl, {
        folder: 'products',
      });
      imageUrl = uploadRes.secure_url;
    }

    // Save product to DB
    const product = new Product({ ...rest, imageUrl });
    await product.save();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error: any) {
    // return handleError(error);
    return NextResponse.json(
      { message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  } 
}
