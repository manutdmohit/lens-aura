'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/admin-layout';

interface Accessory {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
}

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Accessory>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAccessories = async () => {
    setLoading(true);
    const res = await fetch('/api/accessories');
    const data = await res.json();
    setAccessories(data.accessories || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({});
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (acc: Accessory) => {
    setForm(acc);
    setEditingId(acc._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/accessories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAccessories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/accessories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    } else {
      await fetch('/api/accessories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    fetchAccessories();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Accessories</h1>
          <Button onClick={handleAdd}>Add Accessory</Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Accessory List</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accessories.map((acc) => (
                    <tr key={acc._id}>
                      <td>{acc.name}</td>
                      <td>${acc.price}</td>
                      <td>{acc.stock}</td>
                      <td>{acc.category}</td>
                      <td>{acc.status}</td>
                      <td>
                        <Button size="sm" onClick={() => handleEdit(acc)} className="mr-2">Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(acc._id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 min-w-[300px]">
              <h2 className="text-xl font-bold mb-2">{editingId ? 'Edit' : 'Add'} Accessory</h2>
              <Input name="name" placeholder="Name" value={form.name || ''} onChange={handleFormChange} required />
              <Input name="description" placeholder="Description" value={form.description || ''} onChange={handleFormChange} />
              <Input name="price" type="number" placeholder="Price" value={form.price || ''} onChange={handleFormChange} required />
              <Input name="image" placeholder="Image URL" value={form.image || ''} onChange={handleFormChange} />
              <Input name="stock" type="number" placeholder="Stock" value={form.stock || ''} onChange={handleFormChange} />
              <Input name="category" placeholder="Category" value={form.category || ''} onChange={handleFormChange} />
              <Input name="status" placeholder="Status (active/inactive)" value={form.status || ''} onChange={handleFormChange} />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 