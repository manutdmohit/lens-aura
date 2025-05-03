import { type NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongoose/db-config';
import Glasses from '@/lib/mongoose/models/glasses.model';
import { glassesSchema } from '@/lib/api/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/lib/api/db';

// GET handler to retrieve all glasses products
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse query parameters
    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get('limit') || '10');
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';

    // Build query
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const [glasses, total] = await Promise.all([
      Glasses.find({}).sort(sortOptions).skip(skip).limit(limit).lean(),
      Glasses.countDocuments({}),
    ]);

    // Return response
    return NextResponse.json({
      success: true,
      data: glasses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching glasses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch glasses' },
      { status: 500 }
    );
  }
}

// POST handler to create a new glasses product
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await req.json();

    // Validate request body
    const validationResult = glassesSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Create new glasses product
    const newGlasses = new Glasses({
      ...validationResult.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to database
    await newGlasses.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Glasses product created successfully',
        data: newGlasses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating glasses product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create glasses product' },
      { status: 500 }
    );
  }
}
