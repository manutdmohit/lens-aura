import type { Product, GlassesProduct, SunglassesProduct, ContactLensesProduct } from "@/types/product"

// Mock product data
const mockProducts: (Product | GlassesProduct | SunglassesProduct | ContactLensesProduct)[] = [
  {
    id: "1",
    name: "Archer",
    category: "glasses",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop",
    description: "A timeless frame with a rectangular shape, perfect for any face.",
    colors: ["Black", "Tortoise", "Crystal"],
    inStock: true,
    stockQuantity: 25,
    productType: "Glasses",
    frameType: "full-rim",
    frameMaterial: "acetate",
    frameWidth: "medium",
    frameColor: ["Black", "Tortoise", "Crystal"],
    lensType: "single-vision",
    prescriptionType: "distance",
    gender: "unisex",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bailey",
    category: "glasses",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1000&auto=format&fit=crop",
    description: "A round frame with a keyhole bridge for a classic look.",
    colors: ["Black", "Tortoise", "Navy"],
    inStock: true,
    stockQuantity: 18,
    productType: "Glasses",
    frameType: "full-rim",
    frameMaterial: "acetate",
    frameWidth: "narrow",
    frameColor: ["Black", "Tortoise", "Navy"],
    lensType: "single-vision",
    prescriptionType: "distance",
    gender: "unisex",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Carter",
    category: "sunglasses",
    price: 125,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
    description: "Oversized square sunglasses with UV protection.",
    colors: ["Black", "Tortoise", "Green"],
    inStock: true,
    stockQuantity: 15,
    productType: "Sunglasses",
    frameType: "full-rim",
    frameMaterial: "acetate",
    frameWidth: "wide",
    frameColor: ["Black", "Tortoise", "Green"],
    lensColor: "Green",
    uvProtection: true,
    polarized: true,
    style: "square",
    gender: "unisex",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Dexter",
    category: "sunglasses",
    price: 125,
    imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1000&auto=format&fit=crop",
    description: "Classic aviator sunglasses with polarized lenses.",
    colors: ["Gold", "Silver", "Black"],
    inStock: true,
    stockQuantity: 22,
    productType: "Sunglasses",
    frameType: "full-rim",
    frameMaterial: "metal",
    frameWidth: "medium",
    frameColor: ["Gold", "Silver", "Black"],
    lensColor: "Brown",
    uvProtection: true,
    polarized: true,
    style: "aviator",
    gender: "unisex",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Acuvue Oasys",
    category: "contacts",
    price: 65,
    imageUrl: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=1000&auto=format&fit=crop",
    description: "Bi-weekly contact lenses for all-day comfort.",
    colors: [],
    inStock: true,
    stockQuantity: 50,
    productType: "ContactLenses",
    brand: "Acuvue",
    packagingType: "box",
    wearDuration: "bi-weekly",
    replacementFrequency: "bi-weekly",
    waterContent: 38,
    diameter: 14.0,
    baseCurve: 8.4,
    quantity: 6,
    forAstigmatism: false,
    forPresbyopia: false,
    uvBlocking: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Dailies Total 1",
    category: "contacts",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=1000&auto=format&fit=crop",
    description: "Premium daily disposable contact lenses with water gradient technology.",
    colors: [],
    inStock: true,
    stockQuantity: 35,
    productType: "ContactLenses",
    brand: "Alcon",
    packagingType: "box",
    wearDuration: "daily",
    replacementFrequency: "daily",
    waterContent: 33,
    diameter: 14.1,
    baseCurve: 8.5,
    quantity: 30,
    forAstigmatism: false,
    forPresbyopia: false,
    uvBlocking: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Get all products
export async function getAllProducts() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockProducts]
}

// Get products by type
export async function getProductsByType(type: "Glasses" | "Sunglasses" | "ContactLenses") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProducts.filter((product) => product.productType === type)
}

// Get a single product by ID
export async function getProductById(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockProducts.find((product) => product.id === id) || null
}

// Create a new product
export async function createProduct(productData: any) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const newProduct = {
    ...productData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockProducts.push(newProduct)
  return newProduct
}

// Update an existing product
export async function updateProduct(id: string, productData: any) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const index = mockProducts.findIndex((product) => product.id === id)
  if (index === -1) return null

  const updatedProduct = {
    ...mockProducts[index],
    ...productData,
    updatedAt: new Date().toISOString(),
  }

  mockProducts[index] = updatedProduct
  return updatedProduct
}

// Delete a product
export async function deleteProduct(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockProducts.findIndex((product) => product.id === id)
  if (index === -1) return null

  const deletedProduct = mockProducts[index]
  mockProducts.splice(index, 1)
  return deletedProduct
}

// Search products
export async function searchProducts(query: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()),
  )
}
