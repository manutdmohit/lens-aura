'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/admin-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddAccessoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '', // base64 string
    stock: '',
    category: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/accessories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add accessory');
        setLoading(false);
        return;
      }
      router.push('/admin/accessories');
    } catch (err) {
      setError('Failed to add accessory');
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Accessory</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
              <Input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              <Input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
              <div>
                <label className="block mb-1 font-medium">Image</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded" />
                )}
              </div>
              <Input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
              <Input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <Select value={form.status} onValueChange={val => setForm(f => ({ ...f, status: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => router.push('/admin/accessories')}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 