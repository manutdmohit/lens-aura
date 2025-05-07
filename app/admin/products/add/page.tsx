'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import ImageUpload from '@/components/image-upload';
import { productSchema, type ProductFormValues } from '@/lib/api/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      stockQuantity: 0,
      productType: 'glasses',
      status: 'active',
    } as any,
  });

  const watchProductType = watch('productType');

  // Handle product type change
  const handleProductTypeChange = (
    value: 'glasses' | 'sunglasses' | 'contacts'
  ) => {
    setValue('productType', value);

    // Reset form with appropriate defaults based on product type
    reset({
      ...watch(),
      productType: value,
      frameType: undefined,
      frameMaterial: undefined,
      frameWidth: undefined,
      lensType: undefined,
      prescriptionType: undefined,
      gender: undefined,
      lensColor: undefined,
      uvProtection: false,
      polarized: false,
      style: undefined,
      brand: undefined,
      packagingType: undefined,
      wearDuration: undefined,
      replacementFrequency: undefined,
      waterContent: undefined,
      diameter: undefined,
      baseCurve: undefined,
      quantity: undefined,
      forAstigmatism: false,
      forPresbyopia: false,
      uvBlocking: false,
    } as any);
  };

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
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      let productData;
      // Always send colors as an array of strings for all product types
      productData = {
        ...data,
        colors: colors, // array of strings for all types
        ...(data.productType !== 'contacts' && { frameColor: colors }),
        ...(data.productType === 'contacts' && { lensColor: colors[0] || '' }),
        category: data.productType.toLowerCase(),
      };

      // Determine the API endpoint based on product type
      let endpoint = '/api/admin/products';

      // Send the request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      toast({
        title: 'Product created',
        description: 'The product has been created successfully.',
      });

      // Redirect to products page
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute resource="products" action="create">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Add New Product</h1>
              <p className="text-gray-500">
                Create a new product in your inventory
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of the product
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
                      ) => handleProductTypeChange(value)}
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
                        <SelectItem value="contacts">Contact Lenses</SelectItem>
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
                        className={errors.stockQuantity ? 'border-red-500' : ''}
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
                    Upload product image and add available colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      Product Image <span className="text-red-500">*</span>
                    </Label>
                    <input type="hidden" {...register('imageUrl')} />
                    <ImageUpload
                      currentImage={watch('imageUrl')}
                      onImageUploaded={handleImageUpload}
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-sm">
                        {errors.imageUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colors">
                      {watchProductType !== 'contacts'
                        ? 'Frame Colors'
                        : 'Available Colors'}
                      {watchProductType !== 'contacts' && (
                        <span className="text-red-500">*</span>
                      )}
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
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
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
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {watchProductType !== 'contacts' && colors.length === 0 && (
                      <p className="text-red-500 text-sm">
                        At least one frame color is required
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Type Specific Fields */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specific Details</CardTitle>
                  <CardDescription>
                    Enter the specific details for this{' '}
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
                              <SelectItem value="full-rim">Full Rim</SelectItem>
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
                              <SelectItem value="titanium">Titanium</SelectItem>
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
                            Frame Width <span className="text-red-500">*</span>
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
                                errors.prescriptionType ? 'border-red-500' : ''
                              }
                            >
                              <SelectValue placeholder="Select prescription type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="distance">Distance</SelectItem>
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
                              className={errors.gender ? 'border-red-500' : ''}
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
                              <SelectItem value="full-rim">Full Rim</SelectItem>
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
                              <SelectItem value="titanium">Titanium</SelectItem>
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
                            Frame Width <span className="text-red-500">*</span>
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
                            className={errors.lensColor ? 'border-red-500' : ''}
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
                              <SelectItem value="wayfarer">Wayfarer</SelectItem>
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
                              className={errors.gender ? 'border-red-500' : ''}
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
                            className={errors.diameter ? 'border-red-500' : ''}
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
                            className={errors.baseCurve ? 'border-red-500' : ''}
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
                            className={errors.quantity ? 'border-red-500' : ''}
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
                                  setValue('forAstigmatism', checked as boolean)
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
                                  setValue('forPresbyopia', checked as boolean)
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

            {/* Form Actions */}
            <div className="mt-6 flex justify-end space-x-4">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
