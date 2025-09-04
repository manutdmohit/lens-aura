import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import {
  authenticateAdmin,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { promotionSchema } from '@/lib/api/validation';
import { Promotion } from '@/models';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const promotion = await Promotion.findById(params.id);

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    // Transform the promotion to fix date serialization issues
    const transformedPromotion = {
      _id: promotion._id,
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signature: promotion.signature,
      essential: promotion.essential,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return NextResponse.json({ promotion: transformedPromotion });
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

    // Update the promotion
    const promotion = await Promotion.findByIdAndUpdate(
      params.id,
      validationResult.data,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    // Transform the promotion to fix date serialization issues
    const transformedPromotion = {
      _id: promotion._id,
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signature: promotion.signature,
      essential: promotion.essential,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Promotion updated successfully',
      promotion: transformedPromotion,
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

    const promotion = await Promotion.findByIdAndDelete(params.id);

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
