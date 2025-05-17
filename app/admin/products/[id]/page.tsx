'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import ImageUpload from '@/components/image-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  productSchema,
  type ProductFormValues as Product,
} from '@/lib/api/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      stockQuantity: 0,
      productType: 'glasses',
    } as any,
  });

  const watchProductType = watch('productType');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/products/${productId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data.product);

        // Set form values
        const formData: any = {
          ...data.product,
          productType: data.product.productType.toLowerCase(),
        };

        reset(formData);

        // Set colors based on product type
        if (data.product.productType === 'contacts') {
          setColors(data.product.colors || []);
        } else {
          setColors(data.product.frameColor || data.product.colors || []);
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, reset]);

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
  };

  // Handle adding a color
  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  // Handle removing a color
  const handleRemoveColor = (colorToRemove: string) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: Product) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!productId) {
        throw new Error('Product ID is missing');
      }

      // Validate colors for contact products
      if (data.productType === 'contacts' && colors.length === 0) {
        throw new Error('At least one color is required for contact lenses');
      }

      // Add colors to the data
      const productData = {
        ...data,
        colors,
        // For glasses and sunglasses, add frameColor
        ...(data.productType !== 'contacts' && { frameColor: colors }),
        // For contacts, ensure colors are set
        ...(data.productType === 'contacts' && { colors }),
      };

      // Send the request
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setProduct(updatedProduct.product);

      toast.success('Product updated', {
        description: 'The product has been updated successfully.',
        style: {
          background: 'rgb(59, 130, 246)',
          color: 'white',
        },
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product. Please try again.');
      toast('Error', {
        description: error.message || 'Failed to update product. Please try again.',
        style: {
          background: 'rgb(239, 68, 68)',
          color: 'white',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Get admin token
      // const token = localStorage.getItem('adminToken');
      // if (!token) {
      //   throw new Error('Authentication required');
      // }

      let productStatus;
      productStatus = product?.status;

      if (productStatus === 'active') {
        productStatus = 'inactive';
      } else {
        productStatus = 'active';
      }

      // Send the request
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: productStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product status');
      }

      toast('Product Status Changed', {
        description: 'The product status has been changed to ' + productStatus,
        style: {
          background: 'rgb(59, 130, 246)',
          color: 'white',
        },
      });

      // Redirect to products page
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Failed to delete product. Please try again.');
      toast('Error', {
        description:
          error.message || 'Failed to delete product. Please try again.',
        style: {
          background: 'rgb(239, 68, 68)',
          color: 'white',
        },
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <ProtectedRoute resource="products" action="update">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {isLoading
                  ? 'Loading Product...'
                  : `Edit Product: ${product?.name || ''}`}
              </h1>
              <p className="text-gray-500">Update product details</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-lg text-gray-500">
                Loading product details...
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update the basic details of the product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productType">
                        Product Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={watchProductType}
                        onValueChange={(
                          value: 'glasses' | 'sunglasses' | 'contacts'
                        ) => {
                          setValue('productType', value);
                        }}
                        disabled={true} // Disable changing product type on edit
                      >
                        <SelectTrigger
                          id="productType"
                          className={errors.productType ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="glasses">Glasses</SelectItem>
                          <SelectItem value="sunglasses">Sunglasses</SelectItem>
                          <SelectItem value="contacts">
                            Contact Lenses
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.productType && (
                        <p className="text-red-500 text-sm">
                          {errors.productType.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register('name')}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        rows={5}
                        {...register('description')}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">
                          Price ($) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register('price')}
                          className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">
                          Stock Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          {...register('stockQuantity')}
                          className={
                            errors.stockQuantity ? 'border-red-500' : ''
                          }
                        />
                        {errors.stockQuantity && (
                          <p className="text-red-500 text-sm">
                            {errors.stockQuantity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media and Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Colors</CardTitle>
                    <CardDescription>
                      Update product image and available colors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>
                        Product Image <span className="text-red-500">*</span>
                      </Label>
                      <input type="hidden" {...register('imageUrl')} />
                      {product?.imageUrl && (
                        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden mb-4">
                          <Image
                            src={watch('imageUrl') || product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full"
                            width={500}
                            height={500}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute top-2 left-2 z-10 opacity-0 w-full h-full cursor-pointer"
                            title="Update product image"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setValue('imageUrl', event.target.result as string, { shouldValidate: true });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs z-20">
                            Click to update image
                          </div>
                        </div>
                      )}
                      {errors.imageUrl && (
                        <p className="text-red-500 text-sm">
                          {errors.imageUrl.message}
                        </p>
                      )}
                    </div>

                    {watchProductType !== 'accessory' && (
                      <div className="space-y-2">
                        <Label htmlFor="colors">
                          {watchProductType !== 'contacts'
                            ? 'Frame Colors'
                            : 'Available Colors'}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="colorInput"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            placeholder="Add a color (e.g., Black, Red, Blue)"
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            onClick={handleAddColor}
                            variant="outline"
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>

                        {colors.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {colors.map((color) => (
                              <Badge
                                key={color}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {color}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(color)}
                                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        {watchProductType !== 'contacts' &&
                          colors.length === 0 && (
                            <p className="text-red-500 text-sm">
                              At least one frame color is required
                            </p>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Product Type Specific Fields */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Specific Details</CardTitle>
                    <CardDescription>
                      Update the specific details for this{' '}
                      {watchProductType.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Glasses Specific Fields */}
                    {watchProductType === 'glasses' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="frameType">
                              Frame Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameType')}
                              onValueChange={(value) =>
                                setValue('frameType', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameType"
                                className={
                                  errors.frameType ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-rim">
                                  Full Rim
                                </SelectItem>
                                <SelectItem value="semi-rimless">
                                  Semi-Rimless
                                </SelectItem>
                                <SelectItem value="rimless">Rimless</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameType && (
                              <p className="text-red-500 text-sm">
                                {errors.frameType.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="frameMaterial">
                              Frame Material{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameMaterial')}
                              onValueChange={(value) =>
                                setValue('frameMaterial', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameMaterial"
                                className={
                                  errors.frameMaterial ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="acetate">Acetate</SelectItem>
                                <SelectItem value="metal">Metal</SelectItem>
                                <SelectItem value="titanium">
                                  Titanium
                                </SelectItem>
                                <SelectItem value="plastic">Plastic</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameMaterial && (
                              <p className="text-red-500 text-sm">
                                {errors.frameMaterial.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="frameWidth">
                              Frame Width{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameWidth')}
                              onValueChange={(value) =>
                                setValue('frameWidth', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameWidth"
                                className={
                                  errors.frameWidth ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame width" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="narrow">Narrow</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="wide">Wide</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameWidth && (
                              <p className="text-red-500 text-sm">
                                {errors.frameWidth.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="lensType">
                              Lens Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('lensType')}
                              onValueChange={(value) =>
                                setValue('lensType', value as any)
                              }
                            >
                              <SelectTrigger
                                id="lensType"
                                className={
                                  errors.lensType ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select lens type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single-vision">
                                  Single Vision
                                </SelectItem>
                                <SelectItem value="bifocal">Bifocal</SelectItem>
                                <SelectItem value="progressive">
                                  Progressive
                                </SelectItem>
                                <SelectItem value="reading">Reading</SelectItem>
                                <SelectItem value="non-prescription">
                                  Non-Prescription
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.lensType && (
                              <p className="text-red-500 text-sm">
                                {errors.lensType.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="prescriptionType">
                              Prescription Type{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('prescriptionType')}
                              onValueChange={(value) =>
                                setValue('prescriptionType', value as any)
                              }
                            >
                              <SelectTrigger
                                id="prescriptionType"
                                className={
                                  errors.prescriptionType
                                    ? 'border-red-500'
                                    : ''
                                }
                              >
                                <SelectValue placeholder="Select prescription type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="distance">
                                  Distance
                                </SelectItem>
                                <SelectItem value="reading">Reading</SelectItem>
                                <SelectItem value="multifocal">
                                  Multifocal
                                </SelectItem>
                                <SelectItem value="non-prescription">
                                  Non-Prescription
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.prescriptionType && (
                              <p className="text-red-500 text-sm">
                                {errors.prescriptionType.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gender">
                              Gender <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('gender')}
                              onValueChange={(value) =>
                                setValue('gender', value as any)
                              }
                            >
                              <SelectTrigger
                                id="gender"
                                className={
                                  errors.gender ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="unisex">Unisex</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.gender && (
                              <p className="text-red-500 text-sm">
                                {errors.gender.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sunglasses Specific Fields */}
                    {watchProductType === 'sunglasses' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="frameType">
                              Frame Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameType')}
                              onValueChange={(value) =>
                                setValue('frameType', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameType"
                                className={
                                  errors.frameType ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-rim">
                                  Full Rim
                                </SelectItem>
                                <SelectItem value="semi-rimless">
                                  Semi-Rimless
                                </SelectItem>
                                <SelectItem value="rimless">Rimless</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameType && (
                              <p className="text-red-500 text-sm">
                                {errors.frameType.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="frameMaterial">
                              Frame Material{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameMaterial')}
                              onValueChange={(value) =>
                                setValue('frameMaterial', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameMaterial"
                                className={
                                  errors.frameMaterial ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="acetate">Acetate</SelectItem>
                                <SelectItem value="metal">Metal</SelectItem>
                                <SelectItem value="titanium">
                                  Titanium
                                </SelectItem>
                                <SelectItem value="plastic">Plastic</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameMaterial && (
                              <p className="text-red-500 text-sm">
                                {errors.frameMaterial.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="frameWidth">
                              Frame Width{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('frameWidth')}
                              onValueChange={(value) =>
                                setValue('frameWidth', value as any)
                              }
                            >
                              <SelectTrigger
                                id="frameWidth"
                                className={
                                  errors.frameWidth ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select frame width" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="narrow">Narrow</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="wide">Wide</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.frameWidth && (
                              <p className="text-red-500 text-sm">
                                {errors.frameWidth.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lensColor">
                              Lens Color <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="lensColor"
                              placeholder="e.g., Black, Brown, Green"
                              {...register('lensColor')}
                              className={
                                errors.lensColor ? 'border-red-500' : ''
                              }
                            />
                            {errors.lensColor && (
                              <p className="text-red-500 text-sm">
                                {errors.lensColor.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="style">
                              Style <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('style')}
                              onValueChange={(value) =>
                                setValue('style', value as any)
                              }
                            >
                              <SelectTrigger
                                id="style"
                                className={errors.style ? 'border-red-500' : ''}
                              >
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aviator">Aviator</SelectItem>
                                <SelectItem value="wayfarer">
                                  Wayfarer
                                </SelectItem>
                                <SelectItem value="round">Round</SelectItem>
                                <SelectItem value="square">Square</SelectItem>
                                <SelectItem value="cat-eye">Cat Eye</SelectItem>
                                <SelectItem value="sport">Sport</SelectItem>
                                <SelectItem value="oversized">
                                  Oversized
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.style && (
                              <p className="text-red-500 text-sm">
                                {errors.style.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gender">
                              Gender <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('gender')}
                              onValueChange={(value) =>
                                setValue('gender', value as any)
                              }
                            >
                              <SelectTrigger
                                id="gender"
                                className={
                                  errors.gender ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="unisex">Unisex</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.gender && (
                              <p className="text-red-500 text-sm">
                                {errors.gender.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Features</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="uvProtection"
                                  checked={watch('uvProtection')}
                                  onCheckedChange={(checked) =>
                                    setValue('uvProtection', checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor="uvProtection"
                                  className="font-normal"
                                >
                                  UV Protection
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="polarized"
                                  checked={watch('polarized')}
                                  onCheckedChange={(checked) =>
                                    setValue('polarized', checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor="polarized"
                                  className="font-normal"
                                >
                                  Polarized
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Lenses Specific Fields */}
                    {watchProductType === 'contacts' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="brand">
                              Brand <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="brand"
                              placeholder="e.g., Acuvue, Dailies"
                              {...register('brand')}
                              className={errors.brand ? 'border-red-500' : ''}
                            />
                            {errors.brand && (
                              <p className="text-red-500 text-sm">
                                {errors.brand.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="packagingType">
                              Packaging Type{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('packagingType')}
                              onValueChange={(value) =>
                                setValue('packagingType', value as any)
                              }
                            >
                              <SelectTrigger
                                id="packagingType"
                                className={
                                  errors.packagingType ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select packaging type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="box">Box</SelectItem>
                                <SelectItem value="vial">Vial</SelectItem>
                                <SelectItem value="blister-pack">
                                  Blister Pack
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.packagingType && (
                              <p className="text-red-500 text-sm">
                                {errors.packagingType.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="wearDuration">
                              Wear Duration{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('wearDuration')}
                              onValueChange={(value) =>
                                setValue('wearDuration', value as any)
                              }
                            >
                              <SelectTrigger
                                id="wearDuration"
                                className={
                                  errors.wearDuration ? 'border-red-500' : ''
                                }
                              >
                                <SelectValue placeholder="Select wear duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="bi-weekly">
                                  Bi-Weekly
                                </SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">
                                  Quarterly
                                </SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.wearDuration && (
                              <p className="text-red-500 text-sm">
                                {errors.wearDuration.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="replacementFrequency">
                              Replacement Frequency{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={watch('replacementFrequency')}
                              onValueChange={(value) =>
                                setValue('replacementFrequency', value as any)
                              }
                            >
                              <SelectTrigger
                                id="replacementFrequency"
                                className={
                                  errors.replacementFrequency
                                    ? 'border-red-500'
                                    : ''
                                }
                              >
                                <SelectValue placeholder="Select replacement frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="bi-weekly">
                                  Bi-Weekly
                                </SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">
                                  Quarterly
                                </SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.replacementFrequency && (
                              <p className="text-red-500 text-sm">
                                {errors.replacementFrequency.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="waterContent">
                              Water Content (%){' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="waterContent"
                              type="number"
                              min="0"
                              max="100"
                              {...register('waterContent')}
                              className={
                                errors.waterContent ? 'border-red-500' : ''
                              }
                            />
                            {errors.waterContent && (
                              <p className="text-red-500 text-sm">
                                {errors.waterContent.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="diameter">
                              Diameter (mm){' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="diameter"
                              type="number"
                              step="0.1"
                              {...register('diameter')}
                              className={
                                errors.diameter ? 'border-red-500' : ''
                              }
                            />
                            {errors.diameter && (
                              <p className="text-red-500 text-sm">
                                {errors.diameter.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="baseCurve">
                              Base Curve (mm){' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="baseCurve"
                              type="number"
                              step="0.1"
                              {...register('baseCurve')}
                              className={
                                errors.baseCurve ? 'border-red-500' : ''
                              }
                            />
                            {errors.baseCurve && (
                              <p className="text-red-500 text-sm">
                                {errors.baseCurve.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="quantity">
                              Quantity per Package{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="quantity"
                              type="number"
                              {...register('quantity')}
                              className={
                                errors.quantity ? 'border-red-500' : ''
                              }
                            />
                            {errors.quantity && (
                              <p className="text-red-500 text-sm">
                                {errors.quantity.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Features</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="forAstigmatism"
                                  checked={watch('forAstigmatism')}
                                  onCheckedChange={(checked) =>
                                    setValue(
                                      'forAstigmatism',
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label
                                  htmlFor="forAstigmatism"
                                  className="font-normal"
                                >
                                  For Astigmatism
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="forPresbyopia"
                                  checked={watch('forPresbyopia')}
                                  onCheckedChange={(checked) =>
                                    setValue(
                                      'forPresbyopia',
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label
                                  htmlFor="forPresbyopia"
                                  className="font-normal"
                                >
                                  For Presbyopia
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="uvBlocking"
                                  checked={watch('uvBlocking')}
                                  onCheckedChange={(checked) =>
                                    setValue('uvBlocking', checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor="uvBlocking"
                                  className="font-normal"
                                >
                                  UV Blocking
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Add a section to display available colors when productType is 'contacts' */}
              {watchProductType === 'contacts' && colors.length > 0 && (
                <div>
                  <Label>Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <Badge key={color} className="bg-gray-200 text-gray-800">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-6 flex justify-between">
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isSubmitting || isDeleting}
                      className={`${
                        product && product.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {/* status active display disable product, if inactive display enable product */}
                      {product && product.status === 'active' ? (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disable Product
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Enable Product
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {product?.status === 'active' ? (
                          <>
                            This will disable the product and you can enable the
                            product at anytime.
                          </>
                        ) : (
                          <>
                            This will enable the product and you can disable it
                            back anytime.
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className={
                          product?.status === 'active'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {product?.status === 'active' ? (
                              <>Disabling...</>
                            ) : (
                              <>Enabling...</>
                            )}
                          </>
                        ) : product?.status === 'active' ? (
                          <>Disable</>
                        ) : (
                          <>Enable</>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/products')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}