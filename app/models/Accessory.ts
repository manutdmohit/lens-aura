import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessory extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const AccessorySchema = new Schema<IAccessory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

// Generate slug from name before saving
AccessorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Accessory: Model<IAccessory> = mongoose.models.Accessory || mongoose.model<IAccessory>('Accessory', AccessorySchema);

export default Accessory; 