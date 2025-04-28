import mongoose, { Model } from 'mongoose';
import Product, { type IProduct } from './product.model';

// Glasses interface extending the base Product
export interface IGlasses {
  frameType: 'full-rim' | 'semi-rimless' | 'rimless';
  frameMaterial: 'acetate' | 'metal' | 'titanium' | 'plastic' | 'mixed';
  frameWidth: 'narrow' | 'medium' | 'wide';
  frameColor: string[];
  lensType:
    | 'single-vision'
    | 'bifocal'
    | 'progressive'
    | 'reading'
    | 'non-prescription';
  prescriptionType: 'distance' | 'reading' | 'multifocal' | 'non-prescription';
  gender: 'men' | 'women' | 'unisex';
}

// Create the Glasses schema as a discriminator of Product
const GlassesSchema = new mongoose.Schema<IGlasses>({
  frameType: {
    type: String,
    required: [true, 'Frame type is required'],
    enum: {
      values: ['full-rim', 'semi-rimless', 'rimless'],
      message: '{VALUE} is not a valid frame type',
    },
  },
  frameMaterial: {
    type: String,
    required: [true, 'Frame material is required'],
    enum: {
      values: ['acetate', 'metal', 'titanium', 'plastic', 'mixed'],
      message: '{VALUE} is not a valid frame material',
    },
  },
  frameWidth: {
    type: String,
    required: [true, 'Frame width is required'],
    enum: {
      values: ['narrow', 'medium', 'wide'],
      message: '{VALUE} is not a valid frame width',
    },
  },
  frameColor: {
    type: [String],
    required: [true, 'Frame color is required'],
  },
  lensType: {
    type: String,
    required: [true, 'Lens type is required'],
    enum: {
      values: [
        'single-vision',
        'bifocal',
        'progressive',
        'reading',
        'non-prescription',
      ],
      message: '{VALUE} is not a valid lens type',
    },
  },
  prescriptionType: {
    type: String,
    required: [true, 'Prescription type is required'],
    enum: {
      values: ['distance', 'reading', 'multifocal', 'non-prescription'],
      message: '{VALUE} is not a valid prescription type',
    },
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['men', 'women', 'unisex'],
      message: '{VALUE} is not a valid gender',
    },
  },
});

// Create the Glasses model as a discriminator of Product
const Glasses: Model<IGlasses> =
  mongoose.models.Glasses ||
  Product.discriminator<IGlasses>('Glasses', GlassesSchema);

export default Glasses;
