import { connectToDatabase } from './api/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * Updates the stock quantity of a product
 */
export async function updateProductStock(productId: string | mongoose.Types.ObjectId, quantity: number) {
  try {
    await connectToDatabase();
    
    // Convert productId to ObjectId if it's not already
    const productObjectId = productId instanceof mongoose.Types.ObjectId 
      ? productId 
      : new mongoose.Types.ObjectId(productId);
    
    console.log(`[DEBUG] Updating stock for product: ${productObjectId}, reducing by ${quantity}`);
    
    // First get the current product to check stock
    const currentProduct = await Product.findById(productObjectId);
    
    if (!currentProduct) {
      console.error(`[DEBUG] Product not found: ${productObjectId}`);
      throw new Error(`Product not found: ${productObjectId}`);
    }
    
    // Check if we have enough stock
    if (currentProduct.stockQuantity < quantity) {
      console.error(`[DEBUG] Not enough stock for product ${currentProduct.name}. Current: ${currentProduct.stockQuantity}, Requested: ${quantity}`);
      throw new Error(`Not enough stock for product ${currentProduct.name}`);
    }
    
    // Calculate new stock
    const newStock = Math.max(0, currentProduct.stockQuantity - quantity);
    
    // Update the product with new stock
    const updatedProduct = await Product.findByIdAndUpdate(
      productObjectId,
      { 
        $set: { 
          stockQuantity: newStock,
          inStock: newStock > 0
        }
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      console.error(`[DEBUG] Failed to update product: ${productObjectId}`);
      throw new Error(`Failed to update product: ${productObjectId}`);
    }
    
    console.log(`[DEBUG] Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} remaining (in stock: ${updatedProduct.inStock})`);
    
    return updatedProduct;
  } catch (error) {
    console.error('[DEBUG] Error updating product stock:', error);
    throw error; // Re-throw the error to be handled by the caller
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