'use client';

import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  currentImageCount?: number;
}

export default function MultiImageUpload({
  onImagesUploaded,
  maxImages = 5,
  currentImageCount = 0,
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (currentImageCount + acceptedFiles.length > maxImages) {
      toast({
        title: 'Error',
        description: `You can only upload a maximum of ${maxImages} images.`,
        variant: 'destructive',
      });
      return;
    }

    const filePromises = acceptedFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL'));
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Strings = await Promise.all(filePromises);
      const newPreviews = [...previews, ...base64Strings];
      setPreviews(newPreviews);
      onImagesUploaded(newPreviews);
    } catch (error) {
      console.error('Error reading files:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing the images.',
        variant: 'destructive',
      });
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesUploaded(newPreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-10 h-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
          <p className="text-xs text-gray-500">
            (Max {maxImages} images, up to 5MB each)
          </p>
        </div>
      </div>

      {/* Show uploaded images preview only for non-variant uploads (like contacts/accessories) */}
      {pathname === '/admin/products/add' &&
        currentImageCount === 0 &&
        previews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Uploaded Images:</p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
