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
  const [fileSizeError, setFileSizeError] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (currentImageCount + acceptedFiles.length > maxImages) {
      toast({
        title: 'Error',
        description: `You can only upload a maximum of ${maxImages} images.`,
        variant: 'destructive',
      });
      return;
    }

    // Check file sizes before processing
    const oversizedFiles = acceptedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      const errorMessage = `The following files exceed 5MB limit: ${fileNames}. Please compress them or choose smaller files.`;
      
      setFileSizeError(errorMessage);
      
      toast({
        title: 'File Size Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000, // Show for 5 seconds
      });
      return;
    }

    // Clear any previous file size errors
    setFileSizeError('');

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
          fileSizeError
            ? 'border-red-400 bg-red-50'
            : isDragActive
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

      {/* File Size Error Display */}
      {fileSizeError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold text-sm">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-1">
                File Size Exceeds Limit
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                {fileSizeError}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Maximum file size: 5MB per image
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFileSizeError('')}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
