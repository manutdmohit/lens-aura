// Update product pricing script
// This script updates sunglasses products with specific categories and pricing

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

async function updateProductPricing() {
  try {
    await connectToDatabase();

    console.log('Starting product pricing update...\n');

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
          price: 99,
          discountedPrice: 79,
        },
      }
    );

    console.log(
      `✅ Updated ${signatureResult.modifiedCount} signature category products`
    );
    console.log(`   Price: $99, Discounted Price: $79\n`);

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
          price: 59,
          discountedPrice: 39,
        },
      }
    );

    console.log(
      `✅ Updated ${essentialsResult.modifiedCount} essentials category products`
    );
    console.log(`   Price: $59, Discounted Price: $39\n`);

    // Get summary of updated products
    const signatureProducts = await Product.find({
      productType: 'sunglasses',
      category: 'signature',
      status: 'active',
    }).select('name price discountedPrice');

    const essentialsProducts = await Product.find({
      productType: 'sunglasses',
      category: 'essentials',
      status: 'active',
    }).select('name price discountedPrice');

    console.log('=== SUMMARY ===');
    console.log(`Signature Category (${signatureProducts.length} products):`);
    signatureProducts.forEach((product) => {
      console.log(
        `  - ${product.name}: $${product.price} → $${product.discountedPrice}`
      );
    });

    console.log(
      `\nEssentials Category (${essentialsProducts.length} products):`
    );
    essentialsProducts.forEach((product) => {
      console.log(
        `  - ${product.name}: $${product.price} → $${product.discountedPrice}`
      );
    });

    console.log('\n✅ Product pricing update completed successfully!');
  } catch (error) {
    console.error('Error updating product pricing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
updateProductPricing();
