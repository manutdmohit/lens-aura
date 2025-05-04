import { NextRequest, NextResponse } from 'next/server';
import { updateProductStock, getProductById } from '@/lib/products';
import { connectToDatabase } from '@/lib/api/db';

/**
 * Test endpoint to verify stock reduction functionality
 * Only for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const reduceBy = quantity || 1;
    
    console.log(`Testing stock reduction for product ${productId} by ${reduceBy}`);
    
    await connectToDatabase();
    
    // Get the original product
    const originalProduct = await getProductById(productId);
    
    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const originalStock = originalProduct.stockQuantity;
    console.log(`Current stock for ${originalProduct.name}: ${originalStock}`);
    
    // Update the product stock
    const updatedProduct = await updateProductStock(productId, reduceBy);
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Failed to update product stock' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        originalStock,
        newStock: updatedProduct.stockQuantity,
        reduceBy,
        inStock: updatedProduct.inStock
      }
    });
    
  } catch (error: any) {
    console.error('Error testing stock reduction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 