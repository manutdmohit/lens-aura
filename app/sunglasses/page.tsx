import Navbar from "@/components/navbar"
import ProductGrid from "@/components/product-grid"
import Footer from "@/components/footer"
import { getProductsByCategory } from "@/lib/db"

export default async function SunglassesPage() {
  const products = await getProductsByCategory("sunglasses")

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Sunglasses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our sunglasses start from just $125, including polarized lenses with UV protection. Explore our collection
            of stylish frames for every occasion.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
      <Footer />
    </main>
  )
}
