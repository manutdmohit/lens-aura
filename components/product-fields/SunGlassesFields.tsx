'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldErrors, UseFormRegister, Control } from 'react-hook-form';
import { DimensionFields } from './DimensionFields';

type SunglassesFieldsProps = {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  control: Control<any>;
};

export const SunglassesFields = ({
  register,
  errors,
  control,
}: SunglassesFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Lens Color</Label>
        <Input {...register('lensColor')} />
        {errors.lensColor && (
          <p className="text-red-500">{errors.lensColor.message as string}</p>
        )}

        <Label>UV Protection</Label>
        <Input {...register('uvProtection')} />
        {errors.uvProtection && (
          <p className="text-red-500">
            {errors.uvProtection.message as string}
          </p>
        )}

        <Label>Polarized</Label>
        <Input {...register('polarized')} />
        {errors.polarized && (
          <p className="text-red-500">{errors.polarized.message as string}</p>
        )}
      </div>

      {/* Product Dimensions */}
      <DimensionFields control={control} errors={errors} />
    </div>
  );
};
