import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/admin-layout';

export default function ProductNotFound() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button asChild className="flex items-center">
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    </AdminLayout>
  );
}
