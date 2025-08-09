'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUpload from '@/components/image-upload';
import MultiImageUpload from '@/components/multi-image-upload';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { type FrameColorVariant } from '@/types/product';

interface FrameColorVariantManagerProps {
  variants: FrameColorVariant[];
  onChange: (variants: FrameColorVariant[]) => void;
  productType: string;
}

export default function FrameColorVariantManager({
  variants,
  onChange,
  productType,
}: FrameColorVariantManagerProps) {
  const [newColorInput, setNewColorInput] = useState('');

  // Add a new color variant
  const handleAddColorVariant = () => {
    if (
      newColorInput.trim() &&
      !variants.some((v) => v.color === newColorInput.trim())
    ) {
      const newVariant: FrameColorVariant = {
        color: newColorInput.trim(),
        lensColor: '',
        stockQuantity: undefined as any, // Start empty, not 0
        images: [],
      };
      onChange([...variants, newVariant]);
      setNewColorInput('');
    }
  };

  // Remove a color variant
  const handleRemoveColorVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onChange(updatedVariants);
  };

  // Update a specific variant
  const updateVariant = (
    index: number,
    updates: Partial<FrameColorVariant>
  ) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, ...updates } : variant
    );
    onChange(updatedVariants);
  };

  // Handle multiple images upload for a specific variant
  const handleImagesUpload = (index: number, urls: string[]) => {
    const currentImages = variants[index]?.images || [];
    updateVariant(index, { images: [...currentImages, ...urls] });
  };

  // Remove an image from a variant
  const removeImageFromVariant = (variantIndex: number, imageIndex: number) => {
    const variant = variants[variantIndex];
    if (variant) {
      const updatedImages = variant.images.filter((_, i) => i !== imageIndex);
      updateVariant(variantIndex, { images: updatedImages });
    }
  };

  // Handle stock quantity change
  const handleStockQuantityChange = (index: number, value: string) => {
    // Only set stockQuantity if value is not empty, otherwise undefined
    const stockQuantity =
      value.trim() === '' ? undefined : parseInt(value) || 0;
    updateVariant(index, { stockQuantity } as any);
  };

  if (productType !== 'sunglasses' && productType !== 'glasses') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Frame Color Variants</Label>
        <p className="text-sm text-gray-600">
          Add different frame colors with their specific images and stock
          quantities.
        </p>

        {/* Add new color variant */}
        <div className="flex items-center space-x-2">
          <Input
            value={newColorInput}
            onChange={(e) => setNewColorInput(e.target.value)}
            placeholder="Enter frame color (e.g., Black, Brown, Blue)"
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColorVariant();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddColorVariant}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Color
          </Button>
        </div>

        {/* Display existing variants */}
        {variants.length > 0 && (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <Card
                key={`${variant.color}-${index}`}
                className="border-l-4 border-l-blue-500"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="secondary">{variant.color}</Badge>
                      <span className="text-sm text-gray-500">
                        ({variant.images.length} images)
                      </span>
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={() => handleRemoveColorVariant(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`stock-${index}`}>Stock Quantity</Label>
                      <Input
                        id={`stock-${index}`}
                        type="number"
                        min="0"
                        value={variant.stockQuantity ?? ''}
                        onChange={(e) =>
                          handleStockQuantityChange(index, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lens-color-${index}`}>
                        Lens Color <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`lens-color-${index}`}
                        value={variant.lensColor}
                        onChange={(e) =>
                          updateVariant(index, { lensColor: e.target.value })
                        }
                        placeholder="e.g., Gray, Brown, Green"
                      />
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div className="space-y-2">
                    <Label>Images</Label>

                    {/* Display current images */}
                    {variant.images.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                        {variant.images.map((imageUrl, imageIndex) => (
                          <div
                            key={imageIndex}
                            className="relative group border rounded-lg overflow-hidden"
                          >
                            <img
                              src={imageUrl}
                              alt={`${variant.color} view ${imageIndex + 1}`}
                              className="w-full h-20 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeImageFromVariant(index, imageIndex)
                              }
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload new images */}
                    <MultiImageUpload
                      onImagesUploaded={(urls) =>
                        handleImagesUpload(index, urls)
                      }
                      currentImageCount={variant.images.length}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {variants.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No frame color variants added yet</p>
            <p className="text-sm text-gray-400">
              Add colors to organize your product by frame variants
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
