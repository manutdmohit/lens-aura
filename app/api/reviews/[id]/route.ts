import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase} from '@/lib/api/db';
import {
  authenticate,
  validateRequest,
  handleError,
} from '@/lib/api/middleware';
import { reviewSchema } from '@/lib/api/validation';
import Review from '@/lib/mongoose/models/review.model';
import mongoose from 'mongoose';

export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(context.params.id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { data, error } = validateRequest(reviewSchema, body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await connectToDatabase();

    // Get review
    const review = await Review.findById(context.params.id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user is authorized
    if (
      review.user?.toString() !== session.id &&
      session.role !== 'admin' &&
      session.role !== 'superadmin'
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to update this review' },
        { status: 403 }
      );
    }

    // Update review
    review.rating = data.rating;
    review.title = data.title;
    review.comment = data.comment;

    await review.save();

    return NextResponse.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    return handleError(error);
  } 
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get review
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user is authorized
    if (
      review.user?.toString() !== session.id &&
      session.role !== 'admin' &&
      session.role !== 'superadmin'
    ) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this review' },
        { status: 403 }
      );
    }

    // Delete review
    await Review.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
