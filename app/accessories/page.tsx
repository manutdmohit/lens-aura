'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      const res = await fetch('/api/accessories');
      const data = await res.json();
      setAccessories((data.accessories || []).filter((a: Accessory) => a.status === 'active'));
      setLoading(false);
    };
    fetchAccessories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-2">Accessories</h1>
      <p className="text-center text-gray-500 mb-10">Discover our curated collection of premium eyewear accessories to complement your style and vision.</p>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
      ) : accessories.length === 0 ? (
        <div className="text-center text-gray-500 py-20 text-xl">No accessories available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {accessories.map((acc) => (
            <Link href={`/accessories/${acc.slug}`} key={acc._id}>
              <Card className="group transition-shadow hover:shadow-2xl hover:-translate-y-1 duration-200 cursor-pointer">
                <div className="relative h-56 bg-gray-50 rounded-t-xl overflow-hidden flex items-center justify-center">
                  {acc.image ? (
                    <img src={acc.image} alt={acc.name} className="object-contain h-full w-full transition-transform group-hover:scale-105 duration-200" />
                  ) : (
                    <img src="/placeholder.svg" alt="No image" className="object-contain h-full w-full" />
                  )}
                  {acc.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="truncate text-lg font-semibold">{acc.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{acc.category || 'Accessory'}</Badge>
                    <span className="text-gray-500 text-xs ml-auto">{acc.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-700">${acc.price.toFixed(2)}</div>
                  {acc.description && <div className="text-gray-600 text-sm line-clamp-2">{acc.description}</div>}
                  <Button className="w-full mt-2" variant="secondary" disabled={acc.stock === 0}>View Details</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 