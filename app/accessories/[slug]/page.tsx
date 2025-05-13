'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Accessory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
}

export default function AccessoryPage() {
  const params = useParams();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accessories/${params?.slug}`);
        const data = await res.json();
        if (data.accessory) {
          setAccessory(data.accessory);
        }
      } catch (error) {
        console.error('Failed to fetch accessory:', error);
      }
      setLoading(false);
    };

    if (params?.slug) {
      fetchAccessory();
    }
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-center items-center min-h-[400px]">Loading...</div>
      </div>
    );
  }

  if (!accessory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-gray-500 py-20 text-xl">Accessory not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[400px] bg-gray-50 rounded-xl overflow-hidden">
          {accessory.image ? (
            <img
              src={accessory.image}
              alt={accessory.name}
              className="object-contain h-full w-full"
            />
          ) : (
            <img
              src="/placeholder.svg"
              alt="No image"
              className="object-contain h-full w-full"
            />
          )}
          {accessory.stock === 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              Out of Stock
            </span>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{accessory.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="capitalize">
                  {accessory.category || 'Accessory'}
                </Badge>
                <span className="text-gray-500 text-sm">
                  {accessory.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-4">
                ${accessory.price.toFixed(2)}
              </div>
              {accessory.description && (
                <p className="text-gray-600">{accessory.description}</p>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={accessory.stock === 0}
            >
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 