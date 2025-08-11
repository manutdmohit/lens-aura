'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import MultiImageUpload from '@/components/multi-image-upload';
import FrameColorVariantManager from '@/components/frame-color-variant-manager';
import { productSchema, type ProductFormValues } from '@/lib/api/validation';
import { type FrameColorVariant } from '@/types/product';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Animation for form fields
const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [frameColorVariants, setFrameColorVariants] = useState<
    FrameColorVariant[]
  >([]);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      thumbnail: '',
      images: [],
      stockQuantity: undefined,
      productType: 'sunglasses',
      status: 'active',
      colors: [],
      isFeatured: false, // Added default value for isFeatured
    },
  });

  const watchProductType = watch('productType');

  // Handle product type change
  const handleProductTypeChange = (
    value: 'glasses' | 'sunglasses' | 'contacts' | 'accessory'
  ) => {
    const currentValues = getValues();
    setValue('productType', value);
    setColors([]);
    setFrameColorVariants([]);

    // Reset form with appropriate defaults based on product type
    reset({
      ...currentValues,
      productType: value,
      stockQuantity:
        value === 'sunglasses' || value === 'glasses'
          ? undefined
          : currentValues.stockQuantity,
      colors: [],
      frameType: undefined,
      frameMaterial: undefined,
      frameWidth: undefined,
      lensType: undefined,
      prescriptionType: undefined,
      gender: undefined,
      category: undefined,
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
      isFeatured: false, // Reset isFeatured
    });
  };

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValue('thumbnail', url, { shouldValidate: true });
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = (urls: string[]) => {
    setValue('images', urls, { shouldValidate: true });
  };

  // Handle adding a color
  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
      setValue('colors', [...colors, colorInput.trim()], {
        shouldValidate: true,
      });
    }
  };

  // Handle removing a color
  const handleRemoveColor = (colorToRemove: string) => {
    const updatedColors = colors.filter((color) => color !== colorToRemove);
    setColors(updatedColors);
    setValue('colors', updatedColors, { shouldValidate: true });
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare product data based on product type
      const productData: any = {
        ...data,
        status: 'active',
        isFeatured: data.isFeatured,
      };

      // Handle field assignment based on product type
      if (watchProductType === 'sunglasses' || watchProductType === 'glasses') {
        // For glasses/sunglasses: use frameColorVariants, remove redundant fields
        // Convert undefined stockQuantity values to 0 for database storage
        const processedVariants = frameColorVariants.map((variant) => ({
          ...variant,
          stockQuantity: variant.stockQuantity ?? 0,
        }));
        productData.frameColorVariants = processedVariants;
        delete productData.stockQuantity; // Remove - use frameColorVariants.stockQuantity instead
        delete productData.images; // Remove - use frameColorVariants.images instead
        delete productData.colors; // Remove - use frameColorVariants.color instead
      } else if (watchProductType === 'contacts') {
        // For contacts: use colors as lens colors, keep stockQuantity and images
        productData.colors = colors; // Lens colors for contacts
        productData.stockQuantity = data.stockQuantity;
        productData.images = data.images;
        delete productData.frameColorVariants; // Not applicable for contacts
      } else if (watchProductType === 'accessory') {
        // For accessories: keep stockQuantity and images, colors optional
        productData.stockQuantity = data.stockQuantity;
        productData.images = data.images;
        productData.colors = colors;
        delete productData.frameColorVariants; // Not applicable for accessories
      }

      // Set category only for sunglasses
      if (watchProductType === 'sunglasses') {
        productData.category = data.category;
      } else {
        delete productData.category;
      }

      // Send the request
      const response = await fetch('/api/admin/products', {
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
        title: 'Success',
        description: 'Product created successfully',
      });

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
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-500 mt-1">
                Create a new product in your inventory
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the core details of the product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Label htmlFor="productType">
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watchProductType}
                      onValueChange={handleProductTypeChange}
                    >
                      <SelectTrigger
                        id="productType"
                        className={errors.productType ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunglasses">Sunglasses</SelectItem>
                        <SelectItem value="glasses">Glasses</SelectItem>
                        <SelectItem value="contacts">Contact Lenses</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.productType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.productType.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Label htmlFor="name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label htmlFor="price">
                        Price ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register('price', { valueAsNumber: true })}
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Stock Quantity - Only for contacts and accessories */}
                    {(watchProductType === 'contacts' ||
                      watchProductType === 'accessory') && (
                      <motion.div
                        variants={fieldVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Label htmlFor="stockQuantity">
                          Stock Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register('stockQuantity', {
                            valueAsNumber: true,
                          })}
                          className={
                            errors.stockQuantity ? 'border-red-500' : ''
                          }
                        />
                        {errors.stockQuantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.stockQuantity.message}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFeatured"
                        checked={watch('isFeatured')}
                        onCheckedChange={(checked) =>
                          setValue('isFeatured', checked as boolean, {
                            shouldValidate: true,
                          })
                        }
                      />
                      <Label htmlFor="isFeatured" className="font-normal">
                        Mark as Featured Product
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Featured products are highlighted on the homepage and in
                      promotions.
                    </p>
                    {errors.isFeatured && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.isFeatured.message}
                      </p>
                    )}
                  </motion.div>
                </CardContent>
              </Card>

              {/* Media & Colors */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Media & Colors</CardTitle>
                  <CardDescription>
                    Upload product images and specify available colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Label>
                      Thumbnail Image <span className="text-red-500">*</span>
                    </Label>
                    <input type="hidden" {...register('thumbnail')} />
                    <ImageUpload
                      currentImage={watch('thumbnail')}
                      onImageUploaded={handleImageUpload}
                    />
                    {errors.thumbnail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.thumbnail.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Additional Images - Only for contacts and accessories */}
                  {(watchProductType === 'contacts' ||
                    watchProductType === 'accessory') && (
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label>Additional Images</Label>
                      <input type="hidden" {...register('images')} />
                      <MultiImageUpload
                        onImagesUploaded={handleAdditionalImagesUpload}
                      />
                      {errors.images && (
                        <p className="text-red-500 text-sm mt-1">
                          {Array.isArray(errors.images)
                            ? (errors.images as any[])
                                .map((e) => e.message)
                                .join(', ')
                            : errors.images.message}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {watchProductType === 'contacts' && (
                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label htmlFor="colors">
                        Available Colors <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="colorInput"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          placeholder="Add a color (e.g., Black, Red, Blue)"
                          className="flex-grow"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddColor();
                            }
                          }}
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
                              className="flex items-center gap-1 bg-gray-100 text-gray-700"
                            >
                              {color}
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(color)}
                                className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                                aria-label={`Remove ${color}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      {colors.length === 0 && (
                        <p className="text-red-500 text-sm mt-1">
                          At least one color is required
                        </p>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Frame Color Variants - for Sunglasses and Glasses */}
            {(watchProductType === 'sunglasses' ||
              watchProductType === 'glasses') && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Frame Color Variants</CardTitle>
                  <CardDescription>
                    Organize your {watchProductType} by frame colors. Each color
                    can have its own images and stock quantity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FrameColorVariantManager
                    variants={frameColorVariants}
                    onChange={setFrameColorVariants}
                    productType={watchProductType}
                  />
                </CardContent>
              </Card>
            )}

            {/* Product Type Specific Fields */}
            {watchProductType !== 'accessory' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Product Specific Details</CardTitle>
                  <CardDescription>
                    Enter details specific to {watchProductType.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Glasses Specific Fields */}
                  {watchProductType === 'glasses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameType.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameMaterial.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameWidth.message}
                            </p>
                          )}
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.lensType.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.prescriptionType.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.gender.message}
                            </p>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Sunglasses Specific Fields */}
                  {watchProductType === 'sunglasses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={watch('category')}
                            onValueChange={(value) =>
                              setValue('category', value as any)
                            }
                          >
                            <SelectTrigger
                              id="category"
                              className={
                                errors.category ? 'border-red-500' : ''
                              }
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="signature">
                                Signature
                              </SelectItem>
                              <SelectItem value="essentials">
                                Essentials
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.category && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.category.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameType.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameMaterial.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.frameWidth.message}
                            </p>
                          )}
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.style.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.gender.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Contact Lenses Specific Fields */}
                  {watchProductType === 'contacts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.brand.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.packagingType.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.wearDuration.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.replacementFrequency.message}
                            </p>
                          )}
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="waterContent">
                            Water Content (%){' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="waterContent"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...register('waterContent', {
                              valueAsNumber: true,
                            })}
                            className={
                              errors.waterContent ? 'border-red-500' : ''
                            }
                          />
                          {errors.waterContent && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.waterContent.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="diameter">
                            Diameter (mm){' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="diameter"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            {...register('diameter', { valueAsNumber: true })}
                            className={errors.diameter ? 'border-red-500' : ''}
                          />
                          {errors.diameter && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.diameter.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="baseCurve">
                            Base Curve (mm){' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="baseCurve"
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            {...register('baseCurve', { valueAsNumber: true })}
                            className={errors.baseCurve ? 'border-red-500' : ''}
                          />
                          {errors.baseCurve && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.baseCurve.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Label htmlFor="quantity">
                            Quantity per Package{' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="0"
                            {...register('quantity', { valueAsNumber: true })}
                            className={errors.quantity ? 'border-red-500' : ''}
                          />
                          {errors.quantity && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.quantity.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          variants={fieldVariants}
                          initial="hidden"
                          animate="visible"
                        >
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
                        </motion.div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <motion.div
              className="flex justify-end space-x-4"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/products')}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
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
            </motion.div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
