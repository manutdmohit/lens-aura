'use client';
import { Controller, FieldErrors, Control } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type DimensionFieldsProps = {
  control: Control<any>;
  errors: FieldErrors;
};

export const DimensionFields = ({ control, errors }: DimensionFieldsProps) => {
  const dimensionFields = [
    {
      name: 'dimensions.eye',
      label: 'Eye (mm)',
      placeholder: 'e.g., 55',
    },
    {
      name: 'dimensions.bridge',
      label: 'Bridge (mm)',
      placeholder: 'e.g., 18',
    },
    {
      name: 'dimensions.temple',
      label: 'Temple (mm)',
      placeholder: 'e.g., 140',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Product Dimensions</Label>
        <p className="text-sm text-gray-500 mt-1">
          Enter the dimensions in millimeters (mm)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensionFields.map(({ name, label, placeholder }) => (
          <div key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <Input
                  id={name}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={placeholder}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(
                      value === '' ? undefined : parseFloat(value)
                    );
                  }}
                  value={field.value || ''}
                />
              )}
            />
            {errors?.dimensions &&
              (errors.dimensions as any)?.[name.split('.')[1]] && (
                <p className="text-red-500 text-sm mt-1">
                  {String(
                    (errors.dimensions as any)[name.split('.')[1]]?.message
                  )}
                </p>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
