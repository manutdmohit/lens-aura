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
import { type FrameColorVariant, type ColorInfo } from '@/types/product';

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
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  // Add a new color variant
  const handleAddColorVariant = () => {
    if (
      newColorName.trim() &&
      !variants.some((v) => v.color.name === newColorName.trim())
    ) {
      const newVariant: FrameColorVariant = {
        color: {
          name: newColorName.trim(),
          hex: newColorHex,
        },
        lensColor: '',
        stockQuantity: undefined as any, // Start empty, not 0
        images: [],
      };
      onChange([...variants, newVariant]);
      setNewColorName('');
      setNewColorHex('#000000');
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

  // Update color info for a specific variant
  const updateColorInfo = (index: number, colorInfo: Partial<ColorInfo>) => {
    const variant = variants[index];
    if (variant) {
      updateVariant(index, {
        color: { ...variant.color, ...colorInfo },
      });
    }
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
        <Card className="p-4 border-dashed border-2 border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="colorName" className="text-sm font-medium">
                  Color Name
                </Label>
                <Input
                  id="colorName"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="e.g., Coffee Grey, Tortoise Shell"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColorVariant();
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="colorHex" className="text-sm font-medium">
                  Color Hex
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="colorHex"
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddColorVariant}
              variant="outline"
              size="sm"
              disabled={!newColorName.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Color Variant
            </Button>
          </div>
        </Card>

        {/* Display existing variants */}
        {variants.length > 0 && (
          <div className="space-y-4">
            {/* Validation Summary */}
            <div
              className={`p-3 rounded-lg border ${
                variants.some(
                  (v) =>
                    !v.color.name || !v.stockQuantity || v.images.length === 0
                )
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-green-50 border-green-300 text-green-800'
              }`}
            >
              <div className="flex items-center space-x-2 text-sm">
                {variants.some(
                  (v) =>
                    !v.color.name || !v.stockQuantity || v.images.length === 0
                ) ? (
                  <>
                    <span>⚠️</span>
                    <span>
                      {
                        variants.filter(
                          (v) =>
                            !v.color.name ||
                            !v.stockQuantity ||
                            v.images.length === 0
                        ).length
                      }{' '}
                      of {variants.length} variants need completion
                    </span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>All {variants.length} variants are complete</span>
                  </>
                )}
              </div>
            </div>
            {variants.map((variant, index) => (
              <Card
                key={index}
                className={`overflow-hidden ${
                  !variant.color.name ||
                  !variant.stockQuantity ||
                  variant.images.length === 0
                    ? 'border-red-300 bg-red-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: variant.color.hex }}
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {variant.color.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Hex: {variant.color.hex}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Validation Status Badge */}
                      {(!variant.color.name ||
                        !variant.stockQuantity ||
                        variant.images.length === 0) && (
                        <Badge variant="destructive" className="text-xs">
                          ⚠️ Incomplete
                        </Badge>
                      )}
                      {variant.color.name &&
                        variant.stockQuantity &&
                        variant.images.length > 0 && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            ✅ Complete
                          </Badge>
                        )}
                      <Button
                        type="button"
                        onClick={() => handleRemoveColorVariant(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Color and Lens Color */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Color Name</Label>
                      <Input
                        value={variant.color.name}
                        onChange={(e) =>
                          updateColorInfo(index, { name: e.target.value })
                        }
                        placeholder="Color name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Color Hex</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={variant.color.hex}
                          onChange={(e) =>
                            updateColorInfo(index, { hex: e.target.value })
                          }
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={variant.color.hex}
                          onChange={(e) =>
                            updateColorInfo(index, { hex: e.target.value })
                          }
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Lens Color</Label>
                    <Input
                      value={variant.lensColor}
                      onChange={(e) =>
                        updateVariant(index, { lensColor: e.target.value })
                      }
                      placeholder="e.g., Clear, Brown, Blue"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Stock Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={variant.stockQuantity || ''}
                      onChange={(e) =>
                        handleStockQuantityChange(index, e.target.value)
                      }
                      placeholder="Enter stock quantity"
                      className={`mt-1 ${
                        !variant.stockQuantity ? 'border-red-500 bg-red-50' : ''
                      }`}
                      min="0"
                    />
                    {!variant.stockQuantity && (
                      <p className="text-red-500 text-xs mt-1">
                        Stock quantity is required
                      </p>
                    )}
                  </div>

                  {/* Images Section */}
                  <div>
                    <Label className="text-sm font-medium flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Product Images <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload images specific to this color variant
                    </p>
                    <MultiImageUpload
                      onImagesUploaded={(urls) =>
                        handleImagesUpload(index, urls)
                      }
                      currentImageCount={variant.images.length}
                    />
                    {variant.images.length === 0 && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
                        ⚠️ At least one image is required for this variant
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  {variant.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {variant.images.map((image, imageIndex) => (
                          <div
                            key={imageIndex}
                            className="relative aspect-square rounded-lg overflow-hidden border"
                          >
                            <img
                              src={image}
                              alt={`${variant.color.name} variant`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                removeImageFromVariant(index, imageIndex)
                              }
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
