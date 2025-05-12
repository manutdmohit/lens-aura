import mongoose, { Schema, Document } from 'mongoose';

export interface IAboutUs extends Document {
  content: string;
  mission: string;
  vision: string;
  values: Array<{
    title: string;
    description: string;
  }>;
  updatedAt: Date;
}

const AboutUsSchema = new Schema<IAboutUs>(
  {
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [50, 'Content must be at least 50 characters'],
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    mission: {
      type: String,
      required: [true, 'Mission is required'],
      trim: true,
      minlength: [20, 'Mission must be at least 20 characters'],
      maxlength: [500, 'Mission cannot exceed 500 characters'],
    },
    vision: {
      type: String,
      required: [true, 'Vision is required'],
      trim: true,
      minlength: [20, 'Vision must be at least 20 characters'],
      maxlength: [500, 'Vision cannot exceed 500 characters'],
    },
    values: [
      {
        title: {
          type: String,
          required: [true, 'Value title is required'],
          trim: true,
          minlength: [3, 'Value title must be at least 3 characters'],
          maxlength: [50, 'Value title cannot exceed 50 characters'],
        },
        description: {
          type: String,
          required: [true, 'Value description is required'],
          trim: true,
          minlength: [20, 'Value description must be at least 20 characters'],
          maxlength: [200, 'Value description cannot exceed 200 characters'],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add compound index for better query performance
AboutUsSchema.index({ 'metadata.version': 1, updatedAt: -1 });

// Add validation for values array
AboutUsSchema.path('values').validate(function (values: any[]) {
  return values.length >= 1 && values.length <= 6;
}, 'Values array must contain between 1 and 6 items');

export default mongoose.models.AboutUs || mongoose.model<IAboutUs>('AboutUs', AboutUsSchema); 