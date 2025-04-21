import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function CheckoutLoading() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 mb-6">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center py-4">
                    <Skeleton className="w-16 h-16 rounded-md" />
                    <div className="ml-4 flex-grow">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-16 mb-2" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-48 mb-6" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mb-4" />
              <div className="mt-4 text-center">
                <Skeleton className="h-4 w-48 mx-auto mb-2" />
                <Skeleton className="h-6 w-24 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
