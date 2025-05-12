'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';
import { AboutUsData } from '@/types/about';

const formSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters').max(2000),
  mission: z.string().min(50, 'Mission must be at least 50 characters').max(500),
  vision: z.string().min(50, 'Vision must be at least 50 characters').max(500),
  values: z.array(
    z.object({
      title: z.string().min(3).max(50),
      description: z.string().min(20).max(200),
    })
  ).min(3, 'At least 3 values are required').max(6, 'Maximum 6 values allowed'),
});

export default function AboutUsAdmin() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: AboutUsData = {
    content: `<p>Welcome to Lens Aura...</p>`,
    mission: `<p>Our mission is to empower photographers...</p>`,
    vision: `<p>We envision a world...</p>`,
    values: [
      { title: 'Innovation', description: 'We explore new photography tech.' },
      { title: 'Quality', description: 'We maintain high standards.' },
      { title: 'Community', description: 'We foster a learning environment.' },
    ],
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AboutUsData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const fetchAboutUs = async () => {
    try {
      const res = await fetch('/api/about');
      const data = await res.json();

      if (data.success) {
        const { content, mission, vision, values } = data.data;
        setValue('content', content || defaultValues.content);
        setValue('mission', mission || defaultValues.mission);
        setValue('vision', vision || defaultValues.vision);
        setValue('values', values || defaultValues.values);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load About Us data.');
      setValue('content', defaultValues.content);
      setValue('mission', defaultValues.mission);
      setValue('vision', defaultValues.vision);
      setValue('values', defaultValues.values);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const handleEditorChange = (field: 'content' | 'mission' | 'vision') => (value: string) => {
    setValue(field, value, { shouldDirty: true });
  };

  const onSubmit = async (data: AboutUsData) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success('Content saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save content');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const addValue = () => {
    const current = watch('values');
    if (current.length < 6) {
      setValue('values', [...current, { title: '', description: '' }]);
    }
  };

  const removeValue = (index: number) => {
    const current = watch('values');
    const updated = current.filter((_, i) => i !== index);
    setValue('values', updated);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage About Us Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Main Content</label>
                  <RichTextEditor
                    content={watch('content')}
                    onChange={handleEditorChange('content')}
                    placeholder="Enter main content..."
                  />
                  {errors.content?.message && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mission</label>
                  <RichTextEditor
                    content={watch('mission')}
                    onChange={handleEditorChange('mission')}
                    placeholder="Enter mission..."
                  />
                  {errors.mission?.message && <p className="text-sm text-red-500 mt-1">{errors.mission.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vision</label>
                  <RichTextEditor
                    content={watch('vision')}
                    onChange={handleEditorChange('vision')}
                    placeholder="Enter vision..."
                  />
                  {errors.vision?.message && <p className="text-sm text-red-500 mt-1">{errors.vision.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Values</label>
                    <Button type="button" size="sm" onClick={addValue} disabled={watch('values').length >= 6}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Value
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {watch('values').map((value, index) => (
                      <div key={index} className="border p-4 rounded-md relative grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input {...register(`values.${index}.title`)} placeholder="Title" />
                          {errors.values?.[index]?.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.values[index]?.title?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea {...register(`values.${index}.description`)} placeholder="Description" />
                          {errors.values?.[index]?.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.values[index]?.description?.message}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeValue(index)}
                          disabled={watch('values').length <= 3}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {errors.values?.message && <p className="text-sm text-red-500 mt-1">{errors.values.message}</p>}
                </div>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
