require('dotenv').config();
const mongoose = require('mongoose');

// Connect to production database
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Product schema (simplified for this script)
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  priceForTwo: Number,
});

const Product = mongoose.model('Product', productSchema);

async function checkProductionPriceForTwo() {
  try {
    await connectToDatabase();

    console.log('🔍 Checking production database priceForTwo values...\n');

    // Count products by category and priceForTwo status
    const signatureWithPriceForTwo = await Product.countDocuments({
      category: 'signature',
      priceForTwo: { $exists: true, $ne: null },
    });
    const signatureWithoutPriceForTwo = await Product.countDocuments({
      category: 'signature',
      $or: [{ priceForTwo: { $exists: false } }, { priceForTwo: null }],
    });

    const essentialsWithPriceForTwo = await Product.countDocuments({
      category: 'essentials',
      priceForTwo: { $exists: true, $ne: null },
    });
    const essentialsWithoutPriceForTwo = await Product.countDocuments({
      category: 'essentials',
      $or: [{ priceForTwo: { $exists: false } }, { priceForTwo: null }],
    });

    // Count products with specific priceForTwo values
    const signatureWith139 = await Product.countDocuments({
      category: 'signature',
      priceForTwo: 139,
    });
    const essentialsWith59 = await Product.countDocuments({
      category: 'essentials',
      priceForTwo: 59,
    });

    console.log('📊 Production Database Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 SIGNATURE CATEGORY:');
    console.log(`   ✅ With priceForTwo: ${signatureWithPriceForTwo}`);
    console.log(`   ❌ Without priceForTwo: ${signatureWithoutPriceForTwo}`);
    console.log(`   💰 With priceForTwo: 139: ${signatureWith139}`);
    console.log('');
    console.log('🎯 ESSENTIALS CATEGORY:');
    console.log(`   ✅ With priceForTwo: ${essentialsWithPriceForTwo}`);
    console.log(`   ❌ Without priceForTwo: ${essentialsWithoutPriceForTwo}`);
    console.log(`   💰 With priceForTwo: 59: ${essentialsWith59}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Show sample products
    console.log('\n📋 Sample Products:');
    const sampleSignature = await Product.findOne({ category: 'signature' });
    const sampleEssentials = await Product.findOne({ category: 'essentials' });

    if (sampleSignature) {
      console.log(
        `Signature: ${sampleSignature.name} - priceForTwo: ${
          sampleSignature.priceForTwo || 'NOT SET'
        }`
      );
    }
    if (sampleEssentials) {
      console.log(
        `Essentials: ${sampleEssentials.name} - priceForTwo: ${
          sampleEssentials.priceForTwo || 'NOT SET'
        }`
      );
    }

    // Summary
    const totalWithPriceForTwo =
      signatureWithPriceForTwo + essentialsWithPriceForTwo;
    const totalWithoutPriceForTwo =
      signatureWithoutPriceForTwo + essentialsWithoutPriceForTwo;

    console.log('\n🎉 SUMMARY:');
    console.log(`   Total products with priceForTwo: ${totalWithPriceForTwo}`);
    console.log(
      `   Total products without priceForTwo: ${totalWithoutPriceForTwo}`
    );

    if (totalWithoutPriceForTwo === 0) {
      console.log('   ✅ All products have priceForTwo values set!');
    } else {
      console.log('   ⚠️  Some products still need priceForTwo values');
    }
  } catch (error) {
    console.error('❌ Error checking production database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from production database');
  }
}

// Run the check
checkProductionPriceForTwo();
