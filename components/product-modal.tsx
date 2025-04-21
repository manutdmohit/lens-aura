"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import type { Product } from "@/types/product"

// Base product schema
const baseProductSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive({ message: "Price must be positive" }),
  imageUrl: z.string().min(1, { message: "Please upload an image" }),
  stockQuantity: z.coerce
    .number({ invalid_type_error: "Stock quantity must be a number" })
    .int({ message: "Stock quantity must be a whole number" })
    .nonnegative({ message: "Stock quantity cannot be negative" }),
  productType: z.enum(["Glasses", "Sunglasses", "ContactLenses"], {
    errorMap: () => ({ message: "Please select a valid product type" }),
  }),
})

// Glasses schema
const glassesSchema = baseProductSchema.extend({
  productType: z.literal("Glasses"),
  frameType: z.enum(["full-rim", "semi-rimless", "rimless"]),
  frameMaterial: z.enum(["acetate", "metal", "titanium", "plastic", "mixed"]),
  frameWidth: z.enum(["narrow", "medium", "wide"]),
  frameColor: z.array(z.string()).min(1, { message: "At least one frame color is required" }),
  lensType: z.enum(["single-vision", "bifocal", "progressive", "reading", "non-prescription"]),
  prescriptionType: z.enum(["distance", "reading", "multifocal", "non-prescription"]),
  gender: z.enum(["men", "women", "unisex"]),
})

// Sunglasses schema
const sunglassesSchema = baseProductSchema.extend({
  productType: z.literal("Sunglasses"),
  frameType: z.enum(["full-rim", "semi-rimless", "rimless"]),
  frameMaterial: z.enum(["acetate", "metal", "titanium", "plastic", "mixed"]),
  frameWidth: z.enum(["narrow", "medium", "wide"]),
  frameColor: z.array(z.string()).min(1, { message: "At least one frame color is required" }),
  lensColor: z.string().min(1, { message: "Lens color is required" }),
  uvProtection: z.boolean().default(true),
  polarized: z.boolean().default(false),
  style: z.enum(["aviator", "wayfarer", "round", "square", "cat-eye", "sport", "oversized", "other"]),
  gender: z.enum(["men", "women", "unisex"]),
})

// Contact lenses schema
const contactLensesSchema = baseProductSchema.extend({
  productType: z.literal("ContactLenses"),
  brand: z.string().min(1, { message: "Brand is required" }),
  packagingType: z.enum(["box", "vial", "blister-pack"]),
  wearDuration: z.enum(["daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"]),
  replacementFrequency: z.enum(["daily", "weekly", "bi-weekly", "monthly", "quarterly", "yearly"]),
  waterContent: z.coerce
    .number()
    .min(0, { message: "Water content cannot be negative" })
    .max(100, { message: "Water content cannot exceed 100%" })
    .optional(),
  diameter: z.coerce.number().positive({ message: "Diameter must be positive" }),
  baseCurve: z.coerce.number().positive({ message: "Base curve must be positive" }),
  quantity: z.coerce
    .number()
    .int({ message: "Quantity must be a whole number" })
    .positive({ message: "Quantity must be positive" }),
  forAstigmatism: z.boolean().default(false),
  forPresbyopia: z.boolean().default(false),
  uvBlocking: z.boolean().default(false),
})

// Combined schema
const productSchema = z.discriminatedUnion("productType", [glassesSchema, sunglassesSchema, contactLensesSchema])

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductFormValues) => Promise<void>
  onDelete?: (productId: string) => Promise<void>
  product?: Product | null
  mode: "add" | "edit"
}

export default function ProductModal({ isOpen, onClose, onSave, onDelete, product, mode }: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productType, setProductType] = useState<"Glasses" | "Sunglasses" | "ContactLenses" | "">("")
  const { toast } = useToast()

  // Initialize form with dynamic schema based on product type
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      stockQuantity: 0,
      productType: "Glasses",
    } as any,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = form

  // Watch the product type to update the form schema
  const watchProductType = watch("productType")

  // Set form values when editing an existing product
  useEffect(() => {
    if (product && mode === "edit") {
      setProductType(product.productType)

      // Reset form with product data
      const formData: any = {
        ...product,
        _id: undefined, // Remove MongoDB ID
      }

      reset(formData)
      setImagePreview(product.imageUrl)
    } else if (mode === "add") {
      reset({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        stockQuantity: 0,
        productType: productType || "Glasses",
      } as any)
      setImagePreview(null)
    }
  }, [product, mode, reset, productType])

  // Update product type when it changes in the form
  useEffect(() => {
    if (watchProductType && watchProductType !== productType) {
      setProductType(watchProductType)
    }
  }, [watchProductType, productType])

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setValue("imageUrl", url, { shouldValidate: true })
    setImagePreview(url)
  }

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
      toast({
        title: `Product ${mode === "add" ? "added" : "updated"} successfully`,
        description: `${data.name} has been ${mode === "add" ? "added to" : "updated in"} your inventory.`,
      })
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: `Failed to ${mode === "add" ? "add" : "update"} product. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDelete = async () => {
    if (!product?._id) return

    setIsDeleting(true)
    try {
      await onDelete?.(product._id)
      toast({
        title: "Product deleted",
        description: `${product.name} has been removed from your inventory.`,
      })
      onClose()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // If the modal is not open, don't render anything
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white">
              <h2 className="text-2xl font-bold">{mode === "add" ? "Add New Product" : "Edit Product"}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" aria-label="Close">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="productType" className="text-base">
                    Product Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchProductType}
                    onValueChange={(value: "Glasses" | "Sunglasses" | "ContactLenses") => {
                      setValue("productType", value)
                      setProductType(value)

                      // Reset form with new product type
                      reset({
                        name: watch("name"),
                        description: watch("description"),
                        price: watch("price"),
                        imageUrl: watch("imageUrl"),
                        stockQuantity: watch("stockQuantity"),
                        productType: value,
                      } as any)
                    }}
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger id="productType" className={errors.productType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Glasses">Glasses</SelectItem>
                      <SelectItem value="Sunglasses">Sunglasses</SelectItem>
                      <SelectItem value="ContactLenses">Contact Lenses</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.productType && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.productType.message}
                    </p>
                  )}
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-base">
                        Price ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("price")}
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    {/* Stock Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity" className="text-base">
                        Stock Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        placeholder="0"
                        {...register("stockQuantity")}
                        className={errors.stockQuantity ? "border-red-500" : ""}
                      />
                      {errors.stockQuantity && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.stockQuantity.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Enter product description"
                        rows={5}
                        {...register("description")}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-base">
                        Product Image <span className="text-red-500">*</span>
                      </Label>
                      <input type="hidden" {...register("imageUrl")} />
                      <ImageUpload currentImage={imagePreview} onImageUploaded={handleImageUpload} />
                      {errors.imageUrl && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.imageUrl.message}
                        </p>
                      )}
                    </div>

                    {/* Product Type Specific Fields */}
                    {productType === "Glasses" && (
                      <div className="space-y-4 border p-4 rounded-lg">
                        <h3 className="font-medium">Glasses Specific Details</h3>

                        {/* Frame Type */}
                        <div className="space-y-2">
                          <Label htmlFor="frameType">Frame Type</Label>
                          <Select
                            value={watch("frameType")}
                            onValueChange={(value) => setValue("frameType", value as any)}
                          >
                            <SelectTrigger id="frameType">
                              <SelectValue placeholder="Select frame type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-rim">Full Rim</SelectItem>
                              <SelectItem value="semi-rimless">Semi-Rimless</SelectItem>
                              <SelectItem value="rimless">Rimless</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frameType && <p className="text-red-500 text-sm">{errors.frameType.message}</p>}
                        </div>

                        {/* Frame Material */}
                        <div className="space-y-2">
                          <Label htmlFor="frameMaterial">Frame Material</Label>
                          <Select
                            value={watch("frameMaterial")}
                            onValueChange={(value) => setValue("frameMaterial", value as any)}
                          >
                            <SelectTrigger id="frameMaterial">
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
                            <p className="text-red-500 text-sm">{errors.frameMaterial.message}</p>
                          )}
                        </div>

                        {/* Frame Width */}
                        <div className="space-y-2">
                          <Label htmlFor="frameWidth">Frame Width</Label>
                          <Select
                            value={watch("frameWidth")}
                            onValueChange={(value) => setValue("frameWidth", value as any)}
                          >
                            <SelectTrigger id="frameWidth">
                              <SelectValue placeholder="Select frame width" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="narrow">Narrow</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="wide">Wide</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frameWidth && <p className="text-red-500 text-sm">{errors.frameWidth.message}</p>}
                        </div>

                        {/* Lens Type */}
                        <div className="space-y-2">
                          <Label htmlFor="lensType">Lens Type</Label>
                          <Select
                            value={watch("lensType")}
                            onValueChange={(value) => setValue("lensType", value as any)}
                          >
                            <SelectTrigger id="lensType">
                              <SelectValue placeholder="Select lens type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single-vision">Single Vision</SelectItem>
                              <SelectItem value="bifocal">Bifocal</SelectItem>
                              <SelectItem value="progressive">Progressive</SelectItem>
                              <SelectItem value="reading">Reading</SelectItem>
                              <SelectItem value="non-prescription">Non-Prescription</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.lensType && <p className="text-red-500 text-sm">{errors.lensType.message}</p>}
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value as any)}>
                            <SelectTrigger id="gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="men">Men</SelectItem>
                              <SelectItem value="women">Women</SelectItem>
                              <SelectItem value="unisex">Unisex</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                        </div>
                      </div>
                    )}

                    {productType === "Sunglasses" && (
                      <div className="space-y-4 border p-4 rounded-lg">
                        <h3 className="font-medium">Sunglasses Specific Details</h3>

                        {/* Frame Type */}
                        <div className="space-y-2">
                          <Label htmlFor="frameType">Frame Type</Label>
                          <Select
                            value={watch("frameType")}
                            onValueChange={(value) => setValue("frameType", value as any)}
                          >
                            <SelectTrigger id="frameType">
                              <SelectValue placeholder="Select frame type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-rim">Full Rim</SelectItem>
                              <SelectItem value="semi-rimless">Semi-Rimless</SelectItem>
                              <SelectItem value="rimless">Rimless</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frameType && <p className="text-red-500 text-sm">{errors.frameType.message}</p>}
                        </div>

                        {/* Lens Color */}
                        <div className="space-y-2">
                          <Label htmlFor="lensColor">Lens Color</Label>
                          <Input
                            id="lensColor"
                            placeholder="e.g., Black, Brown, Green"
                            {...register("lensColor")}
                            className={errors.lensColor ? "border-red-500" : ""}
                          />
                          {errors.lensColor && <p className="text-red-500 text-sm">{errors.lensColor.message}</p>}
                        </div>

                        {/* Style */}
                        <div className="space-y-2">
                          <Label htmlFor="style">Style</Label>
                          <Select value={watch("style")} onValueChange={(value) => setValue("style", value as any)}>
                            <SelectTrigger id="style">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aviator">Aviator</SelectItem>
                              <SelectItem value="wayfarer">Wayfarer</SelectItem>
                              <SelectItem value="round">Round</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="cat-eye">Cat Eye</SelectItem>
                              <SelectItem value="sport">Sport</SelectItem>
                              <SelectItem value="oversized">Oversized</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.style && <p className="text-red-500 text-sm">{errors.style.message}</p>}
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <Label>Features</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="uvProtection"
                                checked={watch("uvProtection")}
                                onCheckedChange={(checked) => setValue("uvProtection", checked as boolean)}
                              />
                              <Label htmlFor="uvProtection" className="font-normal">
                                UV Protection
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="polarized"
                                checked={watch("polarized")}
                                onCheckedChange={(checked) => setValue("polarized", checked as boolean)}
                              />
                              <Label htmlFor="polarized" className="font-normal">
                                Polarized
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {productType === "ContactLenses" && (
                      <div className="space-y-4 border p-4 rounded-lg">
                        <h3 className="font-medium">Contact Lenses Specific Details</h3>

                        {/* Brand */}
                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            placeholder="e.g., Acuvue, Dailies"
                            {...register("brand")}
                            className={errors.brand ? "border-red-500" : ""}
                          />
                          {errors.brand && <p className="text-red-500 text-sm">{errors.brand.message}</p>}
                        </div>

                        {/* Packaging Type */}
                        <div className="space-y-2">
                          <Label htmlFor="packagingType">Packaging Type</Label>
                          <Select
                            value={watch("packagingType")}
                            onValueChange={(value) => setValue("packagingType", value as any)}
                          >
                            <SelectTrigger id="packagingType">
                              <SelectValue placeholder="Select packaging type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="vial">Vial</SelectItem>
                              <SelectItem value="blister-pack">Blister Pack</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.packagingType && (
                            <p className="text-red-500 text-sm">{errors.packagingType.message}</p>
                          )}
                        </div>

                        {/* Wear Duration */}
                        <div className="space-y-2">
                          <Label htmlFor="wearDuration">Wear Duration</Label>
                          <Select
                            value={watch("wearDuration")}
                            onValueChange={(value) => setValue("wearDuration", value as any)}
                          >
                            <SelectTrigger id="wearDuration">
                              <SelectValue placeholder="Select wear duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.wearDuration && <p className="text-red-500 text-sm">{errors.wearDuration.message}</p>}
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <Label>Features</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="forAstigmatism"
                                checked={watch("forAstigmatism")}
                                onCheckedChange={(checked) => setValue("forAstigmatism", checked as boolean)}
                              />
                              <Label htmlFor="forAstigmatism" className="font-normal">
                                For Astigmatism
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="forPresbyopia"
                                checked={watch("forPresbyopia")}
                                onCheckedChange={(checked) => setValue("forPresbyopia", checked as boolean)}
                              />
                              <Label htmlFor="forPresbyopia" className="font-normal">
                                For Presbyopia
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="uvBlocking"
                                checked={watch("uvBlocking")}
                                onCheckedChange={(checked) => setValue("uvBlocking", checked as boolean)}
                              />
                              <Label htmlFor="uvBlocking" className="font-normal">
                                UV Blocking
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  {mode === "edit" && onDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={handleDelete}
                      disabled={isDeleting || isSubmitting}
                    >
                      {isDeleting ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Product
                        </>
                      )}
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isDeleting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                    disabled={isSubmitting || isDeleting}
                  >
                    {isSubmitting ? "Saving..." : <>{mode === "add" ? "Add Product" : "Save Changes"}</>}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
