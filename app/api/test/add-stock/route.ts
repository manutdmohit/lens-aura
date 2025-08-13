import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const addQuantity = quantity || 10;

    console.log(`Adding ${addQuantity} stock to product ${productId}`);

    await connectToDatabase();

    // Get the original product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const originalStock = product.stockQuantity ?? 0;
    console.log(`Current stock for ${product.name}: ${originalStock}`);

    // Update the product stock based on product type
    if (
      product.productType === 'glasses' ||
      product.productType === 'sunglasses'
    ) {
      // For glasses/sunglasses, update frameColorVariants
      if (
        !product.frameColorVariants ||
        product.frameColorVariants.length === 0
      ) {
        return NextResponse.json(
          { error: 'No frameColorVariants found' },
          { status: 400 }
        );
      }

      // Update the first variant (or you could specify a color)
      product.frameColorVariants[0].stockQuantity =
        (product.frameColorVariants[0].stockQuantity ?? 0) + addQuantity;
      product.inStock = product.frameColorVariants.some(
        (v) => (v.stockQuantity ?? 0) > 0
      );
    } else {
      // For contacts/accessories, update main stockQuantity
      product.stockQuantity = originalStock + addQuantity;
      product.inStock = true;
    }

    await product.save();

    console.log(`Updated stock for ${product.name}: ${product.stockQuantity}`);

    // Get the new stock value based on product type
    let newStock;
    if (
      product.productType === 'glasses' ||
      product.productType === 'sunglasses'
    ) {
      newStock = product.frameColorVariants?.[0]?.stockQuantity ?? 0;
    } else {
      newStock = product.stockQuantity;
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        productType: product.productType,
        originalStock,
        newStock,
        added: addQuantity,
        inStock: product.inStock,
        frameColorVariants: product.frameColorVariants,
      },
    });
  } catch (error: any) {
    console.error('Error adding stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
