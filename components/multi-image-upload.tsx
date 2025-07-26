'use client';

import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';

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
      onImagesUploaded(base64Strings);
    } catch (error) {
      console.error('Error reading files:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing the images.',
        variant: 'destructive',
      });
    }
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
    </div>
  );
}
