import Navbar from "@/components/navbar"
import ProductGrid from "@/components/product-grid"
import Footer from "@/components/footer"
import { getProductsByCategory } from "@/lib/db"

export default async function GlassesPage() {
  const products = await getProductsByCategory("glasses")

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Glasses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our prescription glasses start from just $95, including standard single-vision lenses. Choose from our wide
            range of styles and colors.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
      <Footer />
    </main>
  )
}
