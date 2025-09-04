'use server';

import { revalidatePath } from 'next/cache';
import { Promotion, type IPromotion } from '@/models';
import { connectToDatabase } from '@/lib/api/db';
import { promotionSchema } from '@/lib/api/validation';

// Create a new promotion
export async function createPromotion(data: any) {
  try {
    await connectToDatabase();

    // Validate the data
    const validatedData = promotionSchema.parse(data);

    // Create the promotion
    const promotion = new Promotion(validatedData);
    await promotion.save();

    revalidatePath('/admin/promotions');
    revalidatePath('/');

    // Convert Mongoose document to plain object
    const plainPromotion = {
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return { success: true, promotion: plainPromotion };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create promotion',
    };
  }
}

// Get all promotions
export async function getPromotions(
  options: {
    isActive?: boolean;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    await connectToDatabase();

    const {
      isActive,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [{ offerName: { $regex: search, $options: 'i' } }];
    }

    // Execute query with pagination
    const promotions = await Promotion.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Promotion.countDocuments(query);

    // Convert Mongoose documents to plain objects
    const plainPromotions = promotions.map((promotion) => ({
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    return {
      success: true,
      promotions: plainPromotions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch promotions',
    };
  }
}

// Get a single promotion by ID
export async function getPromotion(id: string) {
  try {
    await connectToDatabase();

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return { success: false, error: 'Promotion not found' };
    }

    // Convert Mongoose document to plain object
    const plainPromotion = {
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return { success: true, promotion: plainPromotion };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch promotion',
    };
  }
}

// Update a promotion
export async function updatePromotion(id: string, data: any) {
  try {
    await connectToDatabase();

    // Validate the data
    const validatedData = promotionSchema.parse(data);

    // Update the promotion
    const promotion = await Promotion.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return { success: false, error: 'Promotion not found' };
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');

    // Convert Mongoose document to plain object
    const plainPromotion = {
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return { success: true, promotion: plainPromotion };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update promotion',
    };
  }
}

// Delete a promotion
export async function deletePromotion(id: string) {
  try {
    await connectToDatabase();

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return { success: false, error: 'Promotion not found' };
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');

    return { success: true, message: 'Promotion deleted successfully' };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete promotion',
    };
  }
}

// Get active promotions
export async function getActivePromotions(limit: number = 5) {
  try {
    await connectToDatabase();

    console.log('🔍 Querying for active promotions...');
    console.log('🔍 Query filter: { isActive: true }');
    const promotions = await Promotion.find({ isActive: true }).limit(limit);
    console.log('🔍 Raw promotions from database:', promotions);
    console.log('🔍 Number of promotions found:', promotions.length);
    console.log('🔍 First promotion isActive value:', promotions[0]?.isActive);

    // Add more detailed debugging
    if (promotions.length > 0) {
      console.log('🔍 First promotion details:', {
        id: promotions[0]._id,
        name: promotions[0].offerName,
        isActive: promotions[0].isActive,
        signatureDiscountedPrice: promotions[0].signatureDiscountedPrice,
        essentialDiscountedPrice: promotions[0].essentialDiscountedPrice,
      });
    }

    // Convert Mongoose documents to plain objects
    const plainPromotions = promotions.map((promotion) => ({
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    console.log('🔍 Final result being returned:', {
      success: true,
      promotionsCount: plainPromotions.length,
      promotions: plainPromotions,
    });

    return { success: true, promotions: plainPromotions };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch active promotions',
    };
  }
}

// Toggle promotion active status
export async function togglePromotionStatus(id: string) {
  try {
    await connectToDatabase();

    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return { success: false, error: 'Promotion not found' };
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    revalidatePath('/admin/promotions');
    revalidatePath('/');

    // Convert Mongoose document to plain object
    const plainPromotion = {
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    return {
      success: true,
      promotion: plainPromotion,
      message: `Promotion ${
        promotion.isActive ? 'activated' : 'deactivated'
      } successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to toggle promotion status',
    };
  }
}

// Get promotions by date range
export async function getPromotionsByDateRange(startDate: Date, endDate: Date) {
  try {
    await connectToDatabase();

    const promotions = await Promotion.find({
      offerValidFrom: { $lte: endDate },
      offerValidTo: { $gte: startDate },
    });

    // Convert Mongoose documents to plain objects
    const plainPromotions = promotions.map((promotion) => ({
      _id: promotion._id.toString(),
      offerName: promotion.offerName,
      offerValidFrom: promotion.offerValidFrom.toISOString(),
      offerValidTo: promotion.offerValidTo.toISOString(),
      signatureOriginalPrice: promotion.signatureOriginalPrice,
      signatureDiscountedPrice: promotion.signatureDiscountedPrice,
      signaturePriceForTwo: promotion.signaturePriceForTwo,
      essentialOriginalPrice: promotion.essentialOriginalPrice,
      essentialDiscountedPrice: promotion.essentialDiscountedPrice,
      essentialPriceForTwo: promotion.essentialPriceForTwo,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    return { success: true, promotions: plainPromotions };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch promotions by date range',
    };
  }
}
