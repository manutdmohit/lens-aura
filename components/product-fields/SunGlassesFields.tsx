'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

type SunglassesFieldsProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
};

export const SunglassesFields = ({
  register,
  errors,
}: SunglassesFieldsProps) => {
  return (
    <div className="space-y-4">
      <Label>Lens Color</Label>
      <Input {...register('lensColor')} />
      {errors.lensColor && (
        <p className="text-red-500">{errors.lensColor.message as string}</p>
      )}

      <Label>UV Protection</Label>
      <Input {...register('uvProtection')} />
      {errors.uvProtection && (
        <p className="text-red-500">{errors.uvProtection.message as string}</p>
      )}

      <Label>Polarized</Label>
      <Input {...register('polarized')} />
      {errors.polarized && (
        <p className="text-red-500">{errors.polarized.message as string}</p>
      )}
    </div>
  );
};
