import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ContactsLoading() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        {/* Hero section skeleton */}
        <section className="relative bg-[#f5f2ee] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="h-12 bg-gray-300 rounded w-3/4 mb-6 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-5/6 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-4/5 mb-8 animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="aspect-square rounded-2xl bg-gray-300 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Types section skeleton */}
        <div className="py-16 px-4 max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto mb-12 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="space-y-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded w-3/4"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Care section skeleton */}
        <div className="py-16 px-4 max-w-7xl mx-auto bg-gray-50">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto mb-12 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg bg-white p-6 animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional loading skeletons for other sections */}
        {/* ... */}
      </div>
      <Footer />
    </main>
  )
}
