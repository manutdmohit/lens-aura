import { mongoose } from '@/lib/mongoose/db-config';
import { Schema, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for User document
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'superadmin' | 'editor' | 'viewer';
  phoneNumber?: string;
  avatar?: string;
  addresses: {
    type: 'shipping' | 'billing';
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  orders: Schema.Types.ObjectId[];
  wishlist: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in query results by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin', 'superadmin', 'editor', 'viewer'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ['shipping', 'billing'],
          required: [true, 'Address type is required'],
        },
        street: {
          type: String,
          required: [true, 'Street is required'],
        },
        city: {
          type: String,
          required: [true, 'City is required'],
        },
        state: {
          type: String,
          required: [true, 'State is required'],
        },
        postalCode: {
          type: String,
          required: [true, 'Postal code is required'],
        },
        country: {
          type: String,
          required: [true, 'Country is required'],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Create and export the User model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
