import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import {
  authenticateAdmin,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { promotionSchema } from '@/lib/api/validation';
import { Promotion } from '@/models';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [{ offerName: { $regex: search, $options: 'i' } }];
    }

    // Execute query with pagination
    const promotions = await Promotion.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Transform promotions to fix date serialization issues
    const transformedPromotions = promotions.map((promotion) => ({
      _id: promotion._id,
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signature: {
        originalPrice: promotion.signatureOriginalPrice,
        discountedPrice: promotion.signatureDiscountedPrice,
        priceForTwo: promotion.signaturePriceForTwo,
      },
      essential: {
        originalPrice: promotion.essentialOriginalPrice,
        discountedPrice: promotion.essentialDiscountedPrice,
        priceForTwo: promotion.essentialPriceForTwo,
      },
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    // Get total count for pagination
    const total = await Promotion.countDocuments(query);

    return NextResponse.json({
      promotions: transformedPromotions,
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
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();

    // Validate the request body
    const validationResult = validateRequest(promotionSchema, body);

    if (validationResult.error) {
      return NextResponse.json(
        {
          error: 'Promotion validation failed',
          details: validationResult.error.details,
        },
        { status: 400 }
      );
    }

    // Create the promotion
    let promotion;
    try {
      promotion = new Promotion(validationResult.data);
      await promotion.save();
    } catch (saveError) {
      throw saveError;
    }

    // Transform the promotion object to fix date serialization issues
    const transformedPromotion = {
      _id: promotion._id,
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signature: {
        originalPrice: promotion.signatureOriginalPrice,
        discountedPrice: promotion.signatureDiscountedPrice,
        priceForTwo: promotion.signaturePriceForTwo,
      },
      essential: {
        originalPrice: promotion.essentialOriginalPrice,
        discountedPrice: promotion.essentialDiscountedPrice,
        priceForTwo: promotion.essentialPriceForTwo,
      },
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        message: 'Promotion created successfully',
        promotion: transformedPromotion,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
