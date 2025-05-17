import { connectToDatabase } from '@/lib/api/db';
import type { ProductFormValues } from './api/validation';
import { Product } from '@/models';

export async function getProducts() {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    
    return products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      productType: product.productType,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
      colors: product.colors,
      stockQuantity: product.stockQuantity,
    })) as ProductFormValues[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
} 