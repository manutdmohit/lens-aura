'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Plus, X, AlertTriangle } from 'lucide-react';
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
import { DimensionFields } from '@/components/product-fields/DimensionFields';
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
  // console.log('AddProductPage component rendered'); // Removed debug log

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [frameColorVariants, setFrameColorVariants] = useState<
    FrameColorVariant[]
  >([]);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
    getValues,
    control,
    trigger,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      discountedPrice: undefined,
      thumbnail: '',
      images: [],
      stockQuantity: undefined,
      productType: 'sunglasses',
      status: 'active',
      colors: [],
      isFeatured: false, // Added default value for isFeatured
      frameColor: [], // Initialize frameColor as empty array
      lensColor: '', // Initialize lensColor as empty string
      frameColorVariants: [], // Initialize frameColorVariants as empty array
    },
    mode: 'onChange', // Enable real-time validation
  });

  const watchProductType = watch('productType');

  // Auto-set default frame color and lens color for sunglasses when no variants are present
  useEffect(() => {
    if (watchProductType === 'sunglasses' && frameColorVariants.length === 0) {
      setValue('frameColor', ['Default']);
      setValue('lensColor', 'Default');
    } else if (
      watchProductType === 'sunglasses' &&
      frameColorVariants.length > 0
    ) {
      // Clear legacy fields when using variants
      setValue('frameColor', []);
      setValue('lensColor', '');
    }
  }, [watchProductType, frameColorVariants.length, setValue]);

  // Keep form's frameColorVariants field in sync with state
  useEffect(() => {
    // Transform frameColorVariants to ensure stockQuantity is always a number
    const transformedVariants = frameColorVariants.map((variant) => ({
      ...variant,
      stockQuantity: variant.stockQuantity ?? 0,
    }));
    setValue('frameColorVariants', transformedVariants as any);
  }, [frameColorVariants, setValue]);

  // Monitor discounted price changes for debugging
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'discountedPrice') {
        console.log(
          'Discounted price changed:',
          value.discountedPrice,
          'Type:',
          typeof value.discountedPrice
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Ensure discounted price starts as undefined
  useEffect(() => {
    setValue('discountedPrice', undefined);
  }, [setValue]);

  // Enhanced validation function
  const validateForm = async () => {
    const isValid = await trigger();
    if (!isValid) {
      setShowValidationSummary(true);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors below before submitting.',
        variant: 'destructive',
      });
    }
    return isValid;
  };

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

  // Enhanced onSubmit with comprehensive error handling
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    setShowValidationSummary(false);

    try {
      // Pre-submission validation
      const isFormValid = await validateForm();
      if (!isFormValid) {
        setIsSubmitting(false);
        return;
      }

      // Comprehensive custom validation
      const validationErrors: string[] = [];

      // Check for required fields based on product type
      if (data.productType === 'contacts' && colors.length === 0) {
        validationErrors.push(
          'At least one color is required for contact lenses'
        );
      }

      if (
        (data.productType === 'glasses' || data.productType === 'sunglasses') &&
        frameColorVariants.length === 0
      ) {
        validationErrors.push(
          `At least one frame color variant is required for ${data.productType}`
        );
      }

      // Check frame color variants have valid stock quantities
      if (frameColorVariants.length > 0) {
        const invalidVariants = frameColorVariants.filter(
          (variant) =>
            variant.stockQuantity === undefined || variant.stockQuantity < 0
        );
        if (invalidVariants.length > 0) {
          validationErrors.push(
            'All frame color variants must have valid stock quantities'
          );
        }
      }

      // Validate discounted price logic
      if (data.discountedPrice && data.discountedPrice > 0) {
        if (data.discountedPrice >= data.price) {
          validationErrors.push(
            'Discounted price must be less than the regular price'
          );
        }
      }

      // Show validation errors if any
      if (validationErrors.length > 0) {
        setShowValidationSummary(true);
        toast({
          title: 'Validation Failed',
          description: `${validationErrors.length} validation error(s) found. Please review the form.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare product data with proper type handling
      const productData = {
        ...data,
        images: watch('images') || [],
        colors,
        frameColorVariants: frameColorVariants,
        // Handle discounted price properly
        discountedPrice:
          data.discountedPrice && data.discountedPrice > 0
            ? data.discountedPrice
            : undefined,
      };

      // Clean up frameColorVariants if empty
      if (
        !productData.frameColorVariants ||
        productData.frameColorVariants.length === 0
      ) {
        (productData as any).frameColorVariants = undefined;
      }

      console.log('Submitting product data:', productData);

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);

        // Handle specific error types
        if (response.status === 400) {
          throw new Error(
            `Validation Error: ${errorData.message || 'Invalid data provided'}`
          );
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to create products.');
        } else if (response.status === 409) {
          throw new Error(
            `Conflict: ${errorData.message || 'Product already exists'}`
          );
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: Failed to create product`
          );
        }
      }

      const result = await response.json();
      console.log('Product created successfully:', result);

      toast({
        title: 'Success!',
        description: 'Product created successfully.',
      });

      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);

      // Enhanced error handling with specific error types
      let errorMessage = 'Failed to create product';
      let errorTitle = 'Error';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Categorize errors for better UX
        if (errorMessage.includes('Validation Error')) {
          errorTitle = 'Validation Error';
          setShowValidationSummary(true);
        } else if (errorMessage.includes('Authentication failed')) {
          errorTitle = 'Authentication Error';
        } else if (errorMessage.includes('permission')) {
          errorTitle = 'Permission Denied';
        } else if (errorMessage.includes('Conflict')) {
          errorTitle = 'Product Conflict';
        } else if (errorMessage.includes('Server error')) {
          errorTitle = 'Server Error';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 5000, // Show for 5 seconds
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all validation errors for summary with categorization
  const getAllErrors = () => {
    const errorMessages: string[] = [];
    const categorizedErrors: { [key: string]: string[] } = {
      'Basic Information': [],
      'Product Details': [],
      'Inventory & Pricing': [],
      'Images & Media': [],
      'Custom Validation': [],
    };

    // Process form validation errors
    Object.keys(errors).forEach((key) => {
      const error = errors[key as keyof typeof errors];
      if (error?.message) {
        const errorMessage = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${
          error.message
        }`;
        errorMessages.push(errorMessage);

        // Categorize errors
        if (['name', 'description', 'productType'].includes(key)) {
          categorizedErrors['Basic Information'].push(errorMessage);
        } else if (
          [
            'frameType',
            'frameMaterial',
            'frameWidth',
            'lensType',
            'prescriptionType',
            'gender',
            'style',
            'uvProtection',
            'polarized',
            'brand',
            'packagingType',
            'wearDuration',
            'waterContent',
            'diameter',
            'baseCurve',
            'quantity',
            'forAstigmatism',
            'forPresbyopia',
            'uvBlocking',
          ].includes(key)
        ) {
          categorizedErrors['Product Details'].push(errorMessage);
        } else if (
          ['price', 'discountedPrice', 'stockQuantity'].includes(key)
        ) {
          categorizedErrors['Inventory & Pricing'].push(errorMessage);
        } else if (['thumbnail', 'images'].includes(key)) {
          categorizedErrors['Images & Media'].push(errorMessage);
        } else {
          categorizedErrors['Basic Information'].push(errorMessage);
        }
      }
    });

    // Add custom validation errors
    if (watchProductType === 'contacts' && colors.length === 0) {
      const errorMessage =
        'Colors: At least one color is required for contact lenses';
      errorMessages.push(errorMessage);
      categorizedErrors['Custom Validation'].push(errorMessage);
    }

    if (
      (watchProductType === 'glasses' || watchProductType === 'sunglasses') &&
      frameColorVariants.length === 0
    ) {
      const errorMessage = `Frame Color Variants: At least one frame color variant is required for ${watchProductType}`;
      errorMessages.push(errorMessage);
      categorizedErrors['Custom Validation'].push(errorMessage);
    }

    // Store categorized errors for display
    (window as any).categorizedErrors = categorizedErrors;

    return errorMessages;
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

          {/* Enhanced Validation Summary Alert */}
          {showValidationSummary && getAllErrors().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-red-800">
                      ⚠️ Form Validation Errors ({getAllErrors().length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowValidationSummary(false)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-red-100">
                    <ul className="text-sm text-red-700 space-y-2">
                      {getAllErrors().map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1 font-bold">•</span>
                          <span className="leading-relaxed">{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 text-xs text-red-600">
                    Please fix all errors before submitting the form.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Form Status Indicator */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Form Status</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={validateForm}
                className="text-blue-600 hover:text-blue-700 border-blue-300"
              >
                🔍 Validate Form
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Form Validity Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isValid && isDirty ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isValid && isDirty ? '✅ Form Valid' : '⚠️ Incomplete'}
                </span>
              </div>

              {/* Error Count */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">
                  {Object.keys(errors).length} field error(s)
                </span>
              </div>

              {/* Product Specific Details Status */}
              {watchProductType !== 'accessory' && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      (() => {
                        // Check if all required product-specific fields are filled
                        if (
                          watchProductType === 'glasses' ||
                          watchProductType === 'sunglasses'
                        ) {
                          return (
                            watch('frameType') &&
                            watch('frameMaterial') &&
                            watch('frameWidth') &&
                            watch('lensType') &&
                            watch('prescriptionType') &&
                            watch('gender') &&
                            (watchProductType === 'sunglasses'
                              ? watch('category') && watch('style')
                              : true)
                          );
                        }
                        if (watchProductType === 'contacts') {
                          return (
                            watch('brand') &&
                            watch('packagingType') &&
                            watch('wearDuration') &&
                            watch('replacementFrequency') &&
                            watch('waterContent') &&
                            watch('diameter') &&
                            watch('baseCurve') &&
                            watch('quantity')
                          );
                        }
                        return true;
                      })()
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {(() => {
                      if (
                        watchProductType === 'glasses' ||
                        watchProductType === 'sunglasses'
                      ) {
                        const requiredFields = [
                          'frameType',
                          'frameMaterial',
                          'frameWidth',
                          'lensType',
                          'prescriptionType',
                          'gender',
                        ];
                        if (watchProductType === 'sunglasses') {
                          requiredFields.push('category', 'style');
                        }
                        const filledFields = requiredFields.filter((field) =>
                          watch(field as any)
                        );
                        return `📋 ${filledFields.length}/${requiredFields.length} fields`;
                      }
                      if (watchProductType === 'contacts') {
                        const requiredFields = [
                          'brand',
                          'packagingType',
                          'wearDuration',
                          'replacementFrequency',
                          'waterContent',
                          'diameter',
                          'baseCurve',
                          'quantity',
                        ];
                        const filledFields = requiredFields.filter((field) =>
                          watch(field as any)
                        );
                        return `📋 ${filledFields.length}/${requiredFields.length} fields`;
                      }
                      return '✅ Complete';
                    })()}
                  </span>
                </div>
              )}

              {/* Frame Color Variants Status */}
              {(watchProductType === 'sunglasses' ||
                watchProductType === 'glasses') && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      frameColorVariants.length > 0
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {frameColorVariants.length > 0
                      ? `✅ ${frameColorVariants.length} variant(s)`
                      : '❌ No variants'}
                  </span>
                </div>
              )}

              {/* Form State */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">
                  {isDirty ? '📝 Modified' : '📋 Pristine'}
                </span>
              </div>
            </div>

            {/* Detailed Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                  Fields with errors: {Object.keys(errors).join(', ')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValidationSummary(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  👁️ View All Errors
                </Button>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Creating Product...
                    </h3>
                    <p className="text-sm text-gray-500">
                      Please wait while we save your product
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    <Label
                      htmlFor="productType"
                      className="flex items-center space-x-2"
                    >
                      <span>Product Type</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-gray-500 text-xs">(Required)</span>
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
                    <Label
                      htmlFor="name"
                      className="flex items-center space-x-2"
                    >
                      <span>Product Name</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-gray-500 text-xs">(Required)</span>
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
                    <Label
                      htmlFor="description"
                      className="flex items-center space-x-2"
                    >
                      <span>Description</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-gray-500 text-xs">(Required)</span>
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
                      <Label
                        htmlFor="price"
                        className="flex items-center space-x-2"
                      >
                        <span>Price ($)</span>
                        <span className="text-red-500 font-bold">*</span>
                        <span className="text-gray-500 text-xs">
                          (Required)
                        </span>
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

                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label
                        htmlFor="discountedPrice"
                        className="flex items-center space-x-2"
                      >
                        <span>Discounted Price ($)</span>
                        <span className="text-gray-400 text-xs">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="discountedPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00 (leave empty for no discount)"
                        {...register('discountedPrice', {
                          setValueAs: (value) => {
                            console.log(
                              'setValueAs called with:',
                              value,
                              'Type:',
                              typeof value
                            );

                            // Handle empty string and convert to number or undefined
                            if (
                              value === '' ||
                              value === null ||
                              value === undefined ||
                              value === 0 ||
                              value === '0'
                            ) {
                              console.log(
                                'Returning undefined for empty/zero value'
                              );
                              return undefined;
                            }

                            const num = parseFloat(value);
                            console.log(
                              'Parsed number:',
                              num,
                              'isNaN:',
                              isNaN(num)
                            );

                            if (isNaN(num) || num <= 0) {
                              console.log(
                                'Returning undefined for invalid number'
                              );
                              return undefined;
                            }

                            console.log('Returning valid number:', num);
                            return num;
                          },
                        })}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || value === '0') {
                            setValue('discountedPrice', undefined);
                          }
                        }}
                        className={
                          errors.discountedPrice ? 'border-red-500' : ''
                        }
                      />
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">
                          💡 Leave empty if no discount is applied
                        </p>
                        <p className="text-xs text-gray-400">
                          Must be less than regular price when provided
                        </p>
                        {(() => {
                          const price = watch('price');
                          const discountedPrice = watch('discountedPrice');

                          // Debug logging
                          console.log('Price:', price, 'Type:', typeof price);
                          console.log(
                            'Discounted Price:',
                            discountedPrice,
                            'Type:',
                            typeof discountedPrice
                          );

                          // Only show validation if both values are valid numbers
                          if (
                            typeof price === 'number' &&
                            typeof discountedPrice === 'number' &&
                            discountedPrice > 0
                          ) {
                            const isValid = discountedPrice < price;
                            return (
                              <div
                                className={`text-xs p-2 rounded ${
                                  isValid
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {isValid
                                  ? `✅ Valid discount: Save $${(
                                      price - discountedPrice
                                    ).toFixed(2)}`
                                  : `❌ Invalid: Discounted price must be less than $${price}`}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {errors.discountedPrice && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          <span className="font-medium">Error:</span>{' '}
                          {errors.discountedPrice.message?.replace(
                            'NaN',
                            'Invalid value'
                          ) || 'Invalid discounted price'}
                          <div className="mt-1 text-xs text-red-600">
                            Current value:{' '}
                            {JSON.stringify(watch('discountedPrice'))} (Type:{' '}
                            {typeof watch('discountedPrice')})
                          </div>
                        </div>
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

                  {/* Product Dimensions */}
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <DimensionFields control={control} errors={errors} />
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
              <Card
                className={`shadow-sm ${
                  frameColorVariants.length === 0
                    ? 'border-red-300 bg-red-50'
                    : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Frame Color Variants</span>
                    <span className="text-red-500 font-bold">*</span>
                    <span className="text-gray-500 text-sm">(Required)</span>
                  </CardTitle>
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

                  {/* Validation Error Display */}
                  {frameColorVariants.length === 0 && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700">
                        <span className="text-red-500 font-bold">⚠️</span>
                        <span className="text-sm font-medium">
                          At least one frame color variant is required for{' '}
                          {watchProductType}
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        Please add at least one color variant with images and
                        stock quantity.
                      </p>
                    </div>
                  )}

                  {/* Success State */}
                  {frameColorVariants.length > 0 && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <span className="text-green-500 font-bold">✅</span>
                        <span className="text-sm font-medium">
                          {frameColorVariants.length} frame color variant
                          {frameColorVariants.length !== 1 ? 's' : ''}{' '}
                          configured
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Product Type Specific Fields */}
            {watchProductType !== 'accessory' && (
              <Card
                className={`shadow-sm ${
                  (() => {
                    // Check if there are any product-specific field errors
                    if (
                      watchProductType === 'glasses' ||
                      watchProductType === 'sunglasses'
                    ) {
                      return (
                        errors.frameType ||
                        errors.frameMaterial ||
                        errors.frameWidth ||
                        errors.lensType ||
                        errors.prescriptionType ||
                        errors.gender ||
                        (watchProductType === 'sunglasses'
                          ? errors.category || errors.style
                          : false)
                      );
                    }
                    if (watchProductType === 'contacts') {
                      return (
                        errors.brand ||
                        errors.packagingType ||
                        errors.wearDuration ||
                        errors.replacementFrequency ||
                        errors.waterContent ||
                        errors.diameter ||
                        errors.baseCurve ||
                        errors.quantity
                      );
                    }
                    return false;
                  })()
                    ? 'border-red-300 bg-red-50'
                    : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Product Specific Details</span>
                    {(() => {
                      // Check if there are any product-specific field errors
                      if (
                        watchProductType === 'glasses' ||
                        watchProductType === 'sunglasses'
                      ) {
                        return (
                          errors.frameType ||
                          errors.frameMaterial ||
                          errors.frameWidth ||
                          errors.lensType ||
                          errors.prescriptionType ||
                          errors.gender ||
                          (watchProductType === 'sunglasses'
                            ? errors.category || errors.style
                            : false)
                        );
                      }
                      if (watchProductType === 'contacts') {
                        return (
                          errors.brand ||
                          errors.packagingType ||
                          errors.wearDuration ||
                          errors.replacementFrequency ||
                          errors.waterContent ||
                          errors.diameter ||
                          errors.baseCurve ||
                          errors.quantity
                        );
                      }
                      return false;
                    })() && (
                      <Badge variant="destructive" className="text-xs">
                        ⚠️ Has Errors
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Enter details specific to {watchProductType.toLowerCase()}
                  </CardDescription>

                  {/* Completion Status Indicator */}
                  <div className="px-6 pb-2">
                    {(() => {
                      let totalFields = 0;
                      let filledFields = 0;

                      if (
                        watchProductType === 'glasses' ||
                        watchProductType === 'sunglasses'
                      ) {
                        const requiredFields = [
                          'frameType',
                          'frameMaterial',
                          'frameWidth',
                          'lensType',
                          'prescriptionType',
                          'gender',
                        ];
                        if (watchProductType === 'sunglasses') {
                          requiredFields.push('category', 'style');
                        }
                        totalFields = requiredFields.length;
                        filledFields = requiredFields.filter((field) =>
                          watch(field as any)
                        ).length;
                      } else if (watchProductType === 'contacts') {
                        const requiredFields = [
                          'brand',
                          'packagingType',
                          'wearDuration',
                          'replacementFrequency',
                          'waterContent',
                          'diameter',
                          'baseCurve',
                          'quantity',
                        ];
                        totalFields = requiredFields.length;
                        filledFields = requiredFields.filter((field) =>
                          watch(field as any)
                        ).length;
                      }

                      if (totalFields === 0) return null;

                      const completionPercentage = Math.round(
                        (filledFields / totalFields) * 100
                      );
                      const isComplete = filledFields === totalFields;

                      return (
                        <div
                          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            isComplete
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span>{isComplete ? '✅' : '📋'}</span>
                          <span>
                            {isComplete
                              ? 'Complete'
                              : `${filledFields}/${totalFields} fields filled (${completionPercentage}%)`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </CardHeader>

                {/* Product Specific Details Validation Summary */}
                {(() => {
                  const productSpecificErrors: string[] = [];

                  // Collect all product-specific field errors
                  if (
                    watchProductType === 'glasses' ||
                    watchProductType === 'sunglasses'
                  ) {
                    if (errors.frameType)
                      productSpecificErrors.push(
                        `Frame Type: ${errors.frameType.message}`
                      );
                    if (errors.frameMaterial)
                      productSpecificErrors.push(
                        `Frame Material: ${errors.frameMaterial.message}`
                      );
                    if (errors.frameWidth)
                      productSpecificErrors.push(
                        `Frame Width: ${errors.frameWidth.message}`
                      );
                    if (errors.lensType)
                      productSpecificErrors.push(
                        `Lens Type: ${errors.lensType.message}`
                      );
                    if (errors.prescriptionType)
                      productSpecificErrors.push(
                        `Prescription Type: ${errors.prescriptionType.message}`
                      );
                    if (errors.gender)
                      productSpecificErrors.push(
                        `Gender: ${errors.gender.message}`
                      );
                    if (errors.style)
                      productSpecificErrors.push(
                        `Style: ${errors.style.message}`
                      );
                  }

                  if (watchProductType === 'sunglasses') {
                    if (errors.category)
                      productSpecificErrors.push(
                        `Category: ${errors.category.message}`
                      );
                  }

                  if (watchProductType === 'contacts') {
                    if (errors.brand)
                      productSpecificErrors.push(
                        `Brand: ${errors.brand.message}`
                      );
                    if (errors.packagingType)
                      productSpecificErrors.push(
                        `Packaging Type: ${errors.packagingType.message}`
                      );
                    if (errors.wearDuration)
                      productSpecificErrors.push(
                        `Wear Duration: ${errors.wearDuration.message}`
                      );
                    if (errors.replacementFrequency)
                      productSpecificErrors.push(
                        `Replacement Frequency: ${errors.replacementFrequency.message}`
                      );
                    if (errors.waterContent)
                      productSpecificErrors.push(
                        `Water Content: ${errors.waterContent.message}`
                      );
                    if (errors.diameter)
                      productSpecificErrors.push(
                        `Diameter: ${errors.diameter.message}`
                      );
                    if (errors.baseCurve)
                      productSpecificErrors.push(
                        `Base Curve: ${errors.baseCurve.message}`
                      );
                    if (errors.quantity)
                      productSpecificErrors.push(
                        `Quantity: ${errors.quantity.message}`
                      );
                  }

                  return productSpecificErrors.length > 0 ? (
                    <div className="px-6 pb-4">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-red-500 font-bold text-sm">
                            ⚠️
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 mb-2">
                              Product Specific Details Validation Errors (
                              {productSpecificErrors.length})
                            </p>
                            <div className="bg-white rounded-md p-3 border border-red-100">
                              <ul className="text-sm text-red-700 space-y-1">
                                {productSpecificErrors.map((error, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start space-x-2"
                                  >
                                    <span className="text-red-500 mt-1 font-bold">
                                      •
                                    </span>
                                    <span className="leading-relaxed">
                                      {error}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-xs text-red-600 mt-2">
                              Please complete all required fields marked with{' '}
                              <span className="text-red-500">*</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show success state when no errors
                    <div className="px-6 pb-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 font-bold text-sm">
                            ✅
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                              Product Specific Details Complete
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              All required fields for {watchProductType} have
                              been filled correctly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                className={`${
                  isValid && isDirty
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-all duration-200 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting || (!isValid && isDirty)}
                onClick={() => {
                  if (!isValid && isDirty) {
                    setShowValidationSummary(true);
                    toast({
                      title: 'Validation Required',
                      description: 'Please fix all errors before submitting.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isValid && isDirty ? 'Create Product ✓' : 'Create Product'}
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
