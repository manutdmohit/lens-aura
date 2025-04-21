import type { Product } from '@/types/product';

// Mock product data to simulate MongoDB
// Check Product Type Here
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Archer',
    category: 'glasses',
    price: 95,
    imageUrl:
      'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop',
    description:
      'A timeless frame with a rectangular shape, perfect for any face.',
    colors: ['Black', 'Tortoise', 'Crystal'],
    inStock: true,
  },
  {
    id: '2',
    name: 'Bailey',
    category: 'glasses',
    price: 95,
    imageUrl:
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1000&auto=format&fit=crop',
    description: 'A round frame with a keyhole bridge for a classic look.',
    colors: ['Black', 'Tortoise', 'Navy'],
    inStock: true,
  },
  {
    id: '3',
    name: 'Carter',
    category: 'sunglasses',
    price: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    description: 'Oversized square sunglasses with UV protection.',
    colors: ['Black', 'Tortoise', 'Green'],
    inStock: true,
  },
  {
    id: '4',
    name: 'Dexter',
    category: 'sunglasses',
    price: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1000&auto=format&fit=crop',
    description: 'Classic aviator sunglasses with polarized lenses.',
    colors: ['Gold', 'Silver', 'Black'],
    inStock: true,
  },
  {
    id: '5',
    name: 'Ellis',
    category: 'glasses',
    price: 95,
    imageUrl:
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1000&auto=format&fit=crop',
    description: 'A cat-eye frame for a bold, fashionable statement.',
    colors: ['Black', 'Tortoise', 'Red'],
    inStock: true,
  },
  {
    id: '6',
    name: 'Flynn',
    category: 'sunglasses',
    price: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1625591339971-4c9a87a66871?q=80&w=1000&auto=format&fit=crop',
    description: 'Round sunglasses with a retro feel and modern protection.',
    colors: ['Black', 'Tortoise', 'Blue'],
    inStock: true,
  },
  {
    id: '7',
    name: 'Harper',
    category: 'glasses',
    price: 95,
    imageUrl:
      'https://images.unsplash.com/photo-1633621641966-23836fcafd7a?q=80&w=1000&auto=format&fit=crop',
    description: 'A lightweight, minimalist frame with a modern aesthetic.',
    colors: ['Silver', 'Gold', 'Black'],
    inStock: true,
  },
  {
    id: '8',
    name: 'Isla',
    category: 'sunglasses',
    price: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1577744486770-2f42d1e38f29?q=80&w=1000&auto=format&fit=crop',
    description: 'Elegant cat-eye sunglasses with gradient lenses.',
    colors: ['Black', 'Tortoise', 'Burgundy'],
    inStock: true,
  },
];

// Simulate MongoDB find operation
export async function getProducts(limit?: number): Promise<Product[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (limit) {
    return mockProducts.slice(0, limit);
  }
  return mockProducts;
}

// Simulate MongoDB findOne operation
export async function getProductById(id: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const product = mockProducts.find((p) => p.id === id);
  return product || null;
}

// Simulate MongoDB find with filter
export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockProducts.filter((p) => p.category === category);
}

// Simulate MongoDB search
export async function searchProducts(query: string): Promise<Product[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
  );
}
