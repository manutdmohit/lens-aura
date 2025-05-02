'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProductFormValues as Product } from '@/lib/api/validation';
import LoadingPage from './loading';
import Image from 'next/image';
import Link from 'next/link';

// Sample product data
// const products = [
//   {
//     id: "1",
//     name: "Dailies Total 1",
//     brand: "Alcon",
//     price: 89.99,
//     image: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=300&auto=format&fit=crop",
//     description: "Premium daily disposable lenses with water gradient technology for exceptional comfort.",
//   },
//   {
//     id: "2",
//     name: "Acuvue Oasys 1-Day",
//     brand: "ACUVUE",
//     price: 79.99,
//     image: "https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=300&auto=format&fit=crop",
//     description: "Daily disposable lenses with HydraLuxe™ Technology for all-day comfort.",
//   },
//   {
//     id: "3",
//     name: "Biofinity",
//     brand: "CooperVision",
//     price: 69.99,
//     image: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=300&auto=format&fit=crop",
//     description: "Monthly replacement lenses with Aquaform® Technology for natural wettability.",
//   },
//   {
//     id: "4",
//     name: "Air Optix plus HydraGlyde",
//     brand: "Alcon",
//     price: 74.99,
//     image: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=300&auto=format&fit=crop",
//     description: "Monthly replacement lenses with SmartShield™ Technology for deposit resistance.",
//   },
//   {
//     id: "5",
//     name: "1-Day Acuvue Moist",
//     brand: "ACUVUE",
//     price: 65.99,
//     image: "https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=300&auto=format&fit=crop",
//     description: "Daily disposable lenses with LACREON® Technology for long-lasting comfort.",
//   },
//   {
//     id: "6",
//     name: "Dailies AquaComfort Plus",
//     brand: "Alcon",
//     price: 59.99,
//     image: "https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=300&auto=format&fit=crop",
//     description: "Daily disposable lenses with triple action moisture technology.",
//   },
//   {
//     id: "7",
//     name: "MyDay",
//     brand: "CooperVision",
//     price: 72.99,
//     image: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=300&auto=format&fit=crop",
//     description: "Daily disposable lenses with Smart Silicone™ chemistry for breathability.",
//   },
//   {
//     id: "8",
//     name: "Acuvue Oasys for Astigmatism",
//     brand: "ACUVUE",
//     price: 84.99,
//     image: "https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=300&auto=format&fit=crop",
//     description: "Bi-weekly replacement toric lenses for astigmatism with HYDRACLEAR® PLUS Technology.",
//   },
// ]

export default function ContactLensProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/contacts');
        const data = await response.json();
        setProducts(data);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`{error.message} || "Failed to fetch products"`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingPage loading={loading} />;
  }

  return (
    <div
      id="products"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <Link href="/contacts/[slug]" as={`/contacts/${product.slug}`}>
            <Card className="h-full flex flex-col">
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                <Image
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  width={300}
                  height={300}
                  priority
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="mb-auto">
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-medium mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
