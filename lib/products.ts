import { connectToDatabase } from './api/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * Updates the stock quantity of a product
 */
export async function updateProductStock(
  productId: string | mongoose.Types.ObjectId,
  quantity: number,
  color?: string // Optional color for frameColorVariants
) {
  try {
    await connectToDatabase();

    // Convert productId to ObjectId if it's not already
    const productObjectId =
      productId instanceof mongoose.Types.ObjectId
        ? productId
        : new mongoose.Types.ObjectId(productId);

    console.log(
      `[DEBUG] Updating stock for product: ${productObjectId}, reducing by ${quantity}${
        color ? ` for color: ${color}` : ''
      }`
    );

    // First get the current product to check stock
    const currentProduct = await Product.findById(productObjectId);

    if (!currentProduct) {
      console.error(`[DEBUG] Product not found: ${productObjectId}`);
      throw new Error(`Product not found: ${productObjectId}`);
    }

    // Handle different product types
    if (
      currentProduct.productType === 'glasses' ||
      currentProduct.productType === 'sunglasses'
    ) {
      // For glasses/sunglasses, update frameColorVariants
      if (
        !currentProduct.frameColorVariants ||
        currentProduct.frameColorVariants.length === 0
      ) {
        console.error(
          `[DEBUG] No frameColorVariants found for ${currentProduct.name}`
        );
        throw new Error(`No color variants found for ${currentProduct.name}`);
      }

      // If color is specified, find and update that specific variant
      if (color) {
        const variantIndex = currentProduct.frameColorVariants.findIndex(
          (v) => v.color === color
        );
        if (variantIndex === -1) {
          console.error(
            `[DEBUG] Color variant '${color}' not found for ${currentProduct.name}`
          );
          throw new Error(
            `Color variant '${color}' not found for ${currentProduct.name}`
          );
        }

        const variant = currentProduct.frameColorVariants[variantIndex];
        if ((variant.stockQuantity ?? 0) < quantity) {
          console.error(
            `[DEBUG] Not enough stock for ${currentProduct.name} (${color}). Current: ${variant.stockQuantity}, Requested: ${quantity}`
          );
          throw new Error(
            `Not enough stock for ${currentProduct.name} (${color})`
          );
        }

        // Update the specific variant
        const newStock = Math.max(0, (variant.stockQuantity ?? 0) - quantity);
        currentProduct.frameColorVariants[variantIndex].stockQuantity =
          newStock;
      } else {
        // If no color specified, update the first variant with stock
        const availableVariant = currentProduct.frameColorVariants.find(
          (v) => (v.stockQuantity ?? 0) >= quantity
        );
        if (!availableVariant) {
          console.error(
            `[DEBUG] No variant with sufficient stock for ${currentProduct.name}. Available variants:`,
            currentProduct.frameColorVariants.map(
              (v) => `${v.color}: ${v.stockQuantity}`
            )
          );
          throw new Error(
            `No variant with sufficient stock for ${currentProduct.name}`
          );
        }

        const variantIndex = currentProduct.frameColorVariants.findIndex(
          (v) => v.color === availableVariant.color
        );
        const newStock = Math.max(
          0,
          (availableVariant.stockQuantity ?? 0) - quantity
        );
        currentProduct.frameColorVariants[variantIndex].stockQuantity =
          newStock;
      }

      // Update inStock based on frameColorVariants
      currentProduct.inStock = currentProduct.frameColorVariants.some(
        (v) => (v.stockQuantity ?? 0) > 0
      );

      await currentProduct.save();

      console.log(
        `[DEBUG] Updated frameColorVariants stock for ${
          currentProduct.name
        }: ${JSON.stringify(
          currentProduct.frameColorVariants.map(
            (v) => `${v.color}: ${v.stockQuantity}`
          )
        )} (in stock: ${currentProduct.inStock})`
      );

      return currentProduct;
    } else {
      // For contacts/accessories, update main stockQuantity
      if ((currentProduct.stockQuantity ?? 0) < quantity) {
        console.error(
          `[DEBUG] Not enough stock for product ${currentProduct.name}. Current: ${currentProduct.stockQuantity}, Requested: ${quantity}`
        );
        throw new Error(`Not enough stock for product ${currentProduct.name}`);
      }

      // Calculate new stock
      const newStock = Math.max(
        0,
        (currentProduct.stockQuantity ?? 0) - quantity
      );

      // Update the product with new stock
      const updatedProduct = await Product.findByIdAndUpdate(
        productObjectId,
        {
          $set: {
            stockQuantity: newStock,
            inStock: newStock > 0,
          },
        },
        { new: true }
      );

      if (!updatedProduct) {
        console.error(`[DEBUG] Failed to update product: ${productObjectId}`);
        throw new Error(`Failed to update product: ${productObjectId}`);
      }

      console.log(
        `[DEBUG] Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} remaining (in stock: ${updatedProduct.inStock})`
      );

      return updatedProduct;
    }
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
