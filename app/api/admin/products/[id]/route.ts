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
    if (Object.keys(body).length === 1 && body.status) {
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: { status: body.status } },
        { new: true }
      ).lean();

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

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
