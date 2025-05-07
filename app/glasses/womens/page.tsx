"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WomensGlassesPage() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; imageUrl: string; price: number; slug?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch("/api/glasses?gender=women");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Women's Glasses</h1>
      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div>No women's glasses found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  width={200}
                  height={120}
                  className="object-cover rounded mb-2"
                />
                <div className="mb-2">${product.price}</div>
                <Button onClick={() => router.push(`/glasses/${product.slug || product.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 