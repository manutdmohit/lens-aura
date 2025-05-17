"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  currentImage: string | null
  onImageUploaded: (url: string) => void
}

export default function ImageUpload({ currentImage, onImageUploaded }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // In a real application, you would upload the file to a server or cloud storage
    // For this example, we'll use a FileReader to create a data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      // Simulate network delay
      setTimeout(() => {
        if (e.target?.result) {
          // In a real app, this would be the URL returned from your image upload service
          onImageUploaded(e.target.result.toString())
          setIsUploading(false)
        }
      }, 1000)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    onImageUploaded("")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative border rounded-lg overflow-hidden">
          <img
            src={currentImage || "/placeholder.svg"}
            alt="Product preview"
            className="w-full h-48 object-contain bg-gray-50"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors ${
            isDragging ? "border-black bg-gray-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center mb-2">
                Drag and drop an image here, or click to select a file
              </p>
              <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} className="mt-2">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />
      <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, GIF. Maximum file size: 5MB</p>
    </div>
  )
}