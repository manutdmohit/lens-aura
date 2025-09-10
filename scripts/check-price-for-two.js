require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function checkPriceForTwo() {
  try {
    await connectToDatabase();
    console.log('Checking priceForTwo field for all products...\n');

    // Get all active products
    const allProducts = await Product.find({ status: 'active' }).select('name productType category price priceForTwo');
    
    console.log(`Total active products: ${allProducts.length}\n`);

    // Check products with priceForTwo
    const productsWithPriceForTwo = allProducts.filter(p => p.priceForTwo && p.priceForTwo > 0);
    console.log(`Products with priceForTwo: ${productsWithPriceForTwo.length}`);

    // Check products without priceForTwo
    const productsWithoutPriceForTwo = allProducts.filter(p => !p.priceForTwo || p.priceForTwo <= 0);
    console.log(`Products WITHOUT priceForTwo: ${productsWithoutPriceForTwo.length}\n`);

    if (productsWithoutPriceForTwo.length > 0) {
      console.log('❌ Products missing priceForTwo field:');
      productsWithoutPriceForTwo.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.productType}) - Category: ${product.category || 'N/A'}`);
      });
      console.log('\n');
    }

    // Check by category
    const signatureProducts = allProducts.filter(p => p.category === 'signature');
    const essentialsProducts = allProducts.filter(p => p.category === 'essentials');
    const otherProducts = allProducts.filter(p => !p.category || (p.category !== 'signature' && p.category !== 'essentials'));

    console.log('=== CATEGORY BREAKDOWN ===');
    console.log(`Signature products: ${signatureProducts.length}`);
    console.log(`Essentials products: ${essentialsProducts.length}`);
    console.log(`Other products: ${otherProducts.length}\n`);

    // Check signature products
    if (signatureProducts.length > 0) {
      console.log('Signature products:');
      signatureProducts.forEach((product, index) => {
        const hasPriceForTwo = product.priceForTwo && product.priceForTwo > 0;
        console.log(`${index + 1}. ${product.name} - Price: $${product.price} - PriceForTwo: ${hasPriceForTwo ? `$${product.priceForTwo}` : 'MISSING'}`);
      });
      console.log('\n');
    }

    // Check essentials products
    if (essentialsProducts.length > 0) {
      console.log('Essentials products:');
      essentialsProducts.forEach((product, index) => {
        const hasPriceForTwo = product.priceForTwo && product.priceForTwo > 0;
        console.log(`${index + 1}. ${product.name} - Price: $${product.price} - PriceForTwo: ${hasPriceForTwo ? `$${product.priceForTwo}` : 'MISSING'}`);
      });
      console.log('\n');
    }

    // Check other products
    if (otherProducts.length > 0) {
      console.log('Other products (no category or different category):');
      otherProducts.forEach((product, index) => {
        const hasPriceForTwo = product.priceForTwo && product.priceForTwo > 0;
        console.log(`${index + 1}. ${product.name} (${product.productType}) - Price: $${product.price} - PriceForTwo: ${hasPriceForTwo ? `$${product.priceForTwo}` : 'MISSING'}`);
      });
      console.log('\n');
    }

    if (productsWithoutPriceForTwo.length === 0) {
      console.log('✅ All products have priceForTwo field populated!');
    } else {
      console.log(`❌ ${productsWithoutPriceForTwo.length} products are missing priceForTwo field.`);
      console.log('You may need to update these products or set default values.');
    }

  } catch (error) {
    console.error('Error checking priceForTwo field:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkPriceForTwo();
