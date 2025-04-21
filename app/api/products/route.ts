import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getProductsByType, createProduct } from "@/lib/product-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "Glasses" | "Sunglasses" | "ContactLenses" | null

    let products
    if (type) {
      products = await getProductsByType(type)
    } else {
      products = await getAllProducts()
    }

    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.productType) {
      return NextResponse.json({ error: "Product type is required" }, { status: 400 })
    }

    const product = await createProduct(data)
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 })
  }
}
