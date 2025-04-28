import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';

import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    // Await the params first
    const { id } = await ctx.params;

    await connectToDatabase();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json(
      { error: `${error.message || 'Failed to fetch product'}` },
      { status: 500 }
    );
  } finally {
    await disconnectFromDatabase();
  }
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    // const product = await Product.findById(id);

    // if (!product) {
    //   return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    // }

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    await connectToDatabase();

    // Find And Update The Product
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `${error.message || 'Failed to fetch product'}` },
      { status: 500 }
    );
  } finally {
    await disconnectFromDatabase();
  }
}
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // const session = await authenticateAdmin(req);

//     // if (session instanceof NextResponse) {
//     //   return session; // This is an error response
//     // }

//     // Validate ID format
//     if (!mongoose.Types.ObjectId.isValid(params.id)) {
//       return NextResponse.json(
//         { error: 'Invalid product ID format' },
//         { status: 400 }
//       );
//     }

//     const body = await req.json();

//     // Validate based on product type
//     let validationResult;

//     switch (body.productType) {
//       case 'Glasses':
//         validationResult = validateRequest(glassesSchema, body);
//         break;
//       case 'Sunglasses':
//         validationResult = validateRequest(sunglassesSchema, body);
//         break;
//       case 'ContactLenses':
//         validationResult = validateRequest(contactLensesSchema, body);
//         break;
//       default:
//         validationResult = validateRequest(baseProductSchema, body);
//     }

//     const { data, error } = validationResult;

//     if (error) {
//       return NextResponse.json({ error }, { status: 400 });
//     }

//     await connectToDatabase();

//     // Find and update the product
//     const product = await Product.findByIdAndUpdate(
//       params.id,
//       { $set: data },
//       { new: true, runValidators: true }
//     );

//     if (!product) {
//       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: 'Product updated successfully',
//       product,
//     });
//   } catch (error) {
//     return handleError(error);
//   } finally {
//     await disconnectFromDatabase();
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await authenticateAdmin(req);

//     if (session instanceof NextResponse) {
//       return session; // This is an error response
//     }

//     // Validate ID format
//     if (!mongoose.Types.ObjectId.isValid(params.id)) {
//       return NextResponse.json(
//         { error: 'Invalid product ID format' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     const product = await Product.findByIdAndDelete(params.id);

//     if (!product) {
//       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: 'Product deleted successfully',
//     });
//   } catch (error) {
//     return handleError(error);
//   } finally {
//     await disconnectFromDatabase();
//   }
// }
