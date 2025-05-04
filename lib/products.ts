import { connectToDatabase } from './api/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * Updates the stock quantity of a product
 */
export async function updateProductStock(productId: string, quantity: number) {
  try {
    await connectToDatabase();
    
    // Convert productId to ObjectId if it's not already
    const productObjectId = new mongoose.Types.ObjectId(productId);
    
    console.log(`[DEBUG] Updating stock for product: ${productObjectId}, reducing by ${quantity}`);
    
    // Use findOneAndUpdate with $inc for atomic operation
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productObjectId },
      {
        $inc: { stockQuantity: -quantity },
        $set: { 
          inStock: { $gt: ['$stockQuantity', 0] }
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedProduct) {
      console.error(`[DEBUG] Product not found: ${productObjectId}`);
      return null;
    }
    
    console.log(`[DEBUG] Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} remaining (in stock: ${updatedProduct.inStock})`);
    
    return updatedProduct;
  } catch (error) {
    console.error('[DEBUG] Error updating product stock:', error);
    return null;
  }
}

/**
 * Gets a product by ID
 */
export async function getProductById(productId: string) {
  try {
    await connectToDatabase();
    
    // Convert productId to ObjectId if it's not already
    const productObjectId = new mongoose.Types.ObjectId(productId);
    
    const product = await Product.findById(productObjectId);
    
    if (!product) {
      console.error(`[DEBUG] Product not found: ${productObjectId}`);
      return null;
    }
    
    return product;
  } catch (error) {
    console.error('[DEBUG] Error getting product by ID:', error);
    return null;
  }
} 