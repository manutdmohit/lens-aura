'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your checkout process was cancelled. No payment has been processed.
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-medium mb-4">What happens now?</h2>
          <ul className="text-left space-y-2 text-gray-600">
            <li>• Your cart items have been saved</li>
            <li>• You can return to your cart to complete your purchase</li>
            <li>• No payment has been processed</li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            If you experienced any issues during checkout, please contact our
            customer support.
          </p>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
