'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

type ContactLensFieldsProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
};

export const ContactLensFields = ({
  register,
  errors,
}: ContactLensFieldsProps) => {
  return (
    <div className="space-y-4">
      <Label>Brand</Label>
      <Input {...register('brand')} />
      {errors.brand && (
        <p className="text-red-500">{errors.brand.message as string}</p>
      )}

      <Label>Packaging Type</Label>
      <Input {...register('packagingType')} />
      {errors.packagingType && (
        <p className="text-red-500">{errors.packagingType.message as string}</p>
      )}
    </div>
  );
};
