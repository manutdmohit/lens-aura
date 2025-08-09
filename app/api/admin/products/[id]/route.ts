import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import { Product } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error in GET /api/admin/products/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();
    await connectToDatabase();

    // If updating status only
    if (Object.keys(body).length === 1 && 'status' in body) {
      console.log('Status-only update detected:', body);

      // First, check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      console.log('Current product status:', existingProduct.status);

      // Update the status
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: { status: body.status } },
        { new: true, runValidators: true }
      ).lean();

      console.log('Product status after update:', product?.status);

      // Verify the update worked
      const verifyProduct = await Product.findById(id).lean();
      console.log(
        'Verification - product status in DB:',
        verifyProduct?.status
      );

      return NextResponse.json({ product });
    }

    // Full product update
    const updateData: { [key: string]: any } = { ...body };

    // Handle thumbnail upload
    if (body.thumbnail && body.thumbnail.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(body.thumbnail, {
        folder: 'products/thumbnails',
      });
      updateData.thumbnail = uploadRes.secure_url;
    }

    // Handle additional images upload
    if (body.images && Array.isArray(body.images)) {
      const newImageUrls = await Promise.all(
        body.images.map(async (image: string) => {
          if (image.startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(image, {
              folder: 'products/images',
            });
            return uploadRes.secure_url;
          }
          return image; // It's an existing URL
        })
      );
      updateData.images = newImageUrls;
    }

    // Handle frame color variant images upload
    if (body.frameColorVariants && Array.isArray(body.frameColorVariants)) {
      const updatedVariants = await Promise.all(
        body.frameColorVariants.map(async (variant: any) => {
          const updatedVariant = { ...variant };

          // Upload thumbnail if it's a data URL
          if (variant.thumbnail && variant.thumbnail.startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(
              variant.thumbnail,
              {
                folder: `products/frame-colors/${variant.color}/thumbnail`,
              }
            );
            updatedVariant.thumbnail = uploadRes.secure_url;
          }

          // Upload variant images if they are data URLs
          if (variant.images && Array.isArray(variant.images)) {
            const variantImageUrls = await Promise.all(
              variant.images.map(async (image: string) => {
                if (image.startsWith('data:image')) {
                  const uploadRes = await cloudinary.uploader.upload(image, {
                    folder: `products/frame-colors/${variant.color}/images`,
                  });
                  return uploadRes.secure_url;
                }
                return image; // It's an existing URL
              })
            );
            updatedVariant.images = variantImageUrls;
          }

          return updatedVariant;
        })
      );
      updateData.frameColorVariants = updatedVariants;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/products/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}
