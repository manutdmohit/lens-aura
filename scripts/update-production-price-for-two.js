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

async function updateProductionPriceForTwo() {
  try {
    await connectToDatabase();

    console.log('🔄 Updating production database with priceForTwo values...');

    // Update signature category products
    const signatureResult = await Product.updateMany(
      { category: 'signature' },
      { $set: { priceForTwo: 139 } }
    );
    console.log(
      `✅ Updated ${signatureResult.modifiedCount} signature products with priceForTwo: 139`
    );

    // Update essentials category products
    const essentialsResult = await Product.updateMany(
      { category: 'essentials' },
      { $set: { priceForTwo: 59 } }
    );
    console.log(
      `✅ Updated ${essentialsResult.modifiedCount} essentials products with priceForTwo: 59`
    );

    // Verify the updates
    const signatureCount = await Product.countDocuments({
      category: 'signature',
      priceForTwo: 139,
    });
    const essentialsCount = await Product.countDocuments({
      category: 'essentials',
      priceForTwo: 59,
    });

    console.log('\n📊 Verification Results:');
    console.log(
      `- Signature products with priceForTwo: 139: ${signatureCount}`
    );
    console.log(
      `- Essentials products with priceForTwo: 59: ${essentialsCount}`
    );

    // Show total products updated
    const totalUpdated =
      signatureResult.modifiedCount + essentialsResult.modifiedCount;
    console.log(
      `\n🎉 Successfully updated ${totalUpdated} products in production database!`
    );
  } catch (error) {
    console.error('❌ Error updating production database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production database');
  }
}

// Run the update
updateProductionPriceForTwo();
