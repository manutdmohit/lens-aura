// Update priceForTwo field script
// This script updates sunglasses products with priceForTwo field based on category

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define Product schema similar to your application
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productType: {
      type: String,
      required: true,
      enum: ['glasses', 'sunglasses', 'contacts', 'accessory'],
    },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0.01 },
    priceForTwo: { type: Number, min: 0.01 },
    category: {
      type: String,
      enum: ['signature', 'essentials'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Create model
const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function updatePriceForTwo() {
  try {
    await connectToDatabase();

    console.log('Starting priceForTwo field update...\n');

    // Update signature category products
    console.log('Updating signature category products...');
    const signatureResult = await Product.updateMany(
      {
        productType: 'sunglasses',
        category: 'signature',
        status: 'active',
      },
      {
        $set: {
          priceForTwo: 139,
        },
      }
    );

    console.log(
      `✅ Updated ${signatureResult.modifiedCount} signature category products`
    );
    console.log(`   Price for Two: $139\n`);

    // Update essentials category products
    console.log('Updating essentials category products...');
    const essentialsResult = await Product.updateMany(
      {
        productType: 'sunglasses',
        category: 'essentials',
        status: 'active',
      },
      {
        $set: {
          priceForTwo: 59,
        },
      }
    );

    console.log(
      `✅ Updated ${essentialsResult.modifiedCount} essentials category products`
    );
    console.log(`   Price for Two: $59\n`);

    // Get summary of updated products
    const signatureProducts = await Product.find({
      productType: 'sunglasses',
      category: 'signature',
      status: 'active',
    }).select('name price priceForTwo');

    const essentialsProducts = await Product.find({
      productType: 'sunglasses',
      category: 'essentials',
      status: 'active',
    }).select('name price priceForTwo');

    console.log('=== SUMMARY ===');
    console.log(`Signature Category (${signatureProducts.length} products):`);
    signatureProducts.forEach((product) => {
      console.log(
        `  - ${product.name}: Regular $${product.price} → Buy Two $${product.priceForTwo}`
      );
    });

    console.log(
      `\nEssentials Category (${essentialsProducts.length} products):`
    );
    essentialsProducts.forEach((product) => {
      console.log(
        `  - ${product.name}: Regular $${product.price} → Buy Two $${product.priceForTwo}`
      );
    });

    console.log('\n✅ PriceForTwo field update completed successfully!');
  } catch (error) {
    console.error('Error updating priceForTwo field:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
updatePriceForTwo();
