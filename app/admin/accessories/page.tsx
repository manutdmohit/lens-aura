'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const router = useRouter();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Accessory>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const filteredAccessories = accessories.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || acc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (acc: Accessory) => {
    setEditForm(acc);
    setEditingId(acc._id);
    setEditImagePreview(acc.image || null);
    setShowEditModal(true);
    setEditError('');
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, image: reader.result as string }));
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await fetch('/api/accessories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      setShowEditModal(false);
      setEditingId(null);
      setEditForm({});
      setEditImagePreview(null);
      fetchAccessories();
    } catch (err) {
      setEditError('Failed to update accessory');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (acc: Accessory) => {
    await fetch('/api/accessories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: acc._id, status: acc.status === 'active' ? 'inactive' : 'active' }),
    });
    fetchAccessories();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Accessories</h1>
            <p className="text-gray-500">Manage your accessories inventory</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex items-center gap-1"
              onClick={() => router.push('/admin/accessories/add')}
            >
              <Plus className="h-4 w-4" />
              Add Accessory
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Accessories</CardTitle>
                <CardDescription>
                  A list of all accessories in your inventory
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search accessories..."
                    className="pl-10 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  defaultValue="all"
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Optionally, map unique categories from accessories */}
                    {Array.from(new Set(accessories.map(a => a.category).filter(Boolean))).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="ml-4 space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-md ml-4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center py-3 border-b font-medium text-sm text-gray-500">
                  <div className="w-12"></div>
                  <div className="flex-1">Name</div>
                  <div className="flex-1">Category</div>
                  <div className="flex-1">Price</div>
                  <div className="flex-1">Status</div>
                  <div className="w-10"></div>
                </div>
                {filteredAccessories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No accessories found matching your search.
                  </div>
                ) : (
                  filteredAccessories.map((acc, index) => (
                    <motion.div
                      key={acc._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center py-3 border-b last:border-0"
                    >
                      <div className="w-12">
                        <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                          {acc.image ? (
                            <img
                              src={acc.image}
                              alt={acc.name}
                              className="h-full w-full object-cover"
                              height={100}
                              width={100}
                            />
                          ) : (
                            <img
                              src="/placeholder.svg"
                              alt="No image"
                              className="h-full w-full object-cover"
                              height={100}
                              width={100}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 font-medium">{acc.name}</div>
                      <div className="flex-1 capitalize">{acc.category || '-'}</div>
                      <div className="flex-1">${acc.price.toFixed(2)}</div>
                      <div className="flex-1">
                        <Badge
                          variant="outline"
                          className={
                            acc.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {acc.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="w-10 flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(acc)}
                          title="View / Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={acc.status === 'active' ? 'secondary' : 'outline'}
                          size="icon"
                          onClick={() => handleToggleStatus(acc)}
                          title={acc.status === 'active' ? 'Disable' : 'Enable'}
                        >
                          {acc.status === 'active' ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded shadow-md space-y-6 min-w-[350px] max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Accessory</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input name="name" placeholder="Name" value={editForm.name || ''} onChange={handleEditFormChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Input name="description" placeholder="Description" value={editForm.description || ''} onChange={handleEditFormChange} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Price</label>
                  <Input name="price" type="number" placeholder="Price" value={editForm.price || ''} onChange={handleEditFormChange} required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Stock</label>
                  <Input name="stock" type="number" placeholder="Stock" value={editForm.stock || ''} onChange={handleEditFormChange} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Category</label>
                  <Input name="category" placeholder="Category" value={editForm.category || ''} onChange={handleEditFormChange} />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Image</label>
                <Input type="file" accept="image/*" onChange={handleEditImageChange} />
                {editImagePreview && (
                  <div className="mt-2 flex justify-center">
                    <img src={editImagePreview} alt="Preview" className="max-h-40 rounded shadow border" />
                  </div>
                )}
              </div>
            </div>
            {editError && <div className="text-red-500 text-sm text-center">{editError}</div>}
            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
} 