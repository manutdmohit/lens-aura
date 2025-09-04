import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import { handleError } from '@/lib/api/middleware';
import { Promotion } from '@/models';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get('limit') || '5');

    // Get active promotions
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      offerValidFrom: { $lte: now },
      offerValidTo: { $gte: now },
    })
      .sort({ offerValidFrom: 1 })
      .limit(limit);

    // Transform promotions to fix date serialization issues
    const transformedPromotions = promotions.map((promotion) => ({
      _id: promotion._id,
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signature: promotion.signature,
      essential: promotion.essential,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      promotions: transformedPromotions,
      count: transformedPromotions.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
