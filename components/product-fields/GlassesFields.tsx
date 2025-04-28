import { Controller, FieldErrors, Control } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GlassesFieldsProps = {
  control: Control<any>;
  errors: FieldErrors;
};

export const GlassesFields = ({ control, errors }: GlassesFieldsProps) => {
  const fields = [
    {
      name: 'frameType',
      label: 'Frame Type',
      options: ['full-rim', 'semi-rimless', 'rimless'],
    },
    {
      name: 'frameMaterial',
      label: 'Frame Material',
      options: ['acetate', 'metal', 'titanium', 'plastic', 'mixed'],
    },
    {
      name: 'frameWidth',
      label: 'Frame Width',
      options: ['narrow', 'medium', 'wide'],
    },
    {
      name: 'lensType',
      label: 'Lens Type',
      options: [
        'single-vision',
        'bifocal',
        'progressive',
        'reading',
        'non-prescription',
      ],
    },
    {
      name: 'prescriptionType',
      label: 'Prescription Type',
      options: ['distance', 'reading', 'multifocal', 'non-prescription'],
    },
    {
      name: 'gender',
      label: 'Gender',
      options: ['men', 'women', 'unisex'],
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ name, label, options }) => (
        <div key={name}>
          <Label>{label}</Label>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.[name]?.message && (
            <p className="text-red-500 text-sm">
              {String(errors[name]?.message)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
