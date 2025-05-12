import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  // General
  storeName: string;
  storeUrl: string;
  storeDescription: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  // Profile
  name: string;
  email: string;
  phone: string;
  bio: string;
  // Notifications
  emailNotifications: boolean;
  orderUpdates: boolean;
  customerMessages: boolean;
  productUpdates: boolean;
  marketingUpdates: boolean;
  // Add more fields as needed for billing, appearance, email, privacy, etc.
}

const SettingsSchema: Schema = new Schema({
  // General
  storeName: { type: String, default: '' },
  storeUrl: { type: String, default: '' },
  storeDescription: { type: String, default: '' },
  currency: { type: String, default: 'aud' },
  timezone: { type: String, default: 'australia/sydney' },
  maintenanceMode: { type: Boolean, default: false },
  // Profile
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  // Notifications
  emailNotifications: { type: Boolean, default: true },
  orderUpdates: { type: Boolean, default: true },
  customerMessages: { type: Boolean, default: true },
  productUpdates: { type: Boolean, default: true },
  marketingUpdates: { type: Boolean, default: false },
  // Add more fields as needed for billing, appearance, email, privacy, etc.
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema); 