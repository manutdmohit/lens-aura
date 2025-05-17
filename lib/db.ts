import type { ProductFormValues } from './api/validation';

export async function getProducts() {
  try {
    const response = await fetch('/api/admin/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products.map((product: any) => ({
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