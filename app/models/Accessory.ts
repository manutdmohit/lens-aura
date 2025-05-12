import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessory extends Document {
  name: string;
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
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Accessory: Model<IAccessory> = mongoose.models.Accessory || mongoose.model<IAccessory>('Accessory', AccessorySchema);

export default Accessory; 