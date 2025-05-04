// Fix orders script
// This script updates all pending orders to paid status if they have a payment intent

require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// Define Order schema similar to your application
const OrderSchema = new mongoose.Schema({
  userId: { type: String },
  orderNumber: { 
    type: String,
    unique: true,
    required: true
  },
  customerEmail: { type: String },
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    imageUrl: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String }
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentIntent: { type: String },
  stripeSessionId: { type: String, required: true },
});

// Create model
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function fixOrders() {
  try {
    await connectToDatabase();
    
    // Find all pending orders
    const pendingOrders = await Order.find({ paymentStatus: 'pending' });
    console.log(`Found ${pendingOrders.length} pending orders`);
    
    let updatedCount = 0;
    
    // Process each order
    for (const order of pendingOrders) {
      console.log(`Processing order: ${order.orderNumber} (${order._id})`);
      
      // If order has stripeSessionId but no paymentIntent, try to get it from Stripe
      if (order.stripeSessionId && !order.paymentIntent) {
        try {
          console.log(`Fetching session from Stripe: ${order.stripeSessionId}`);
          const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
          
          if (session.payment_status === 'paid' && session.payment_intent) {
            // Update order with payment info
            order.paymentStatus = 'paid';
            order.paymentIntent = session.payment_intent;
            await order.save();
            
            console.log(`✅ Updated order ${order.orderNumber} to paid status`);
            updatedCount++;
          } else {
            console.log(`⚠️ Session ${order.stripeSessionId} payment status: ${session.payment_status}`);
          }
        } catch (error) {
          console.error(`Error fetching session ${order.stripeSessionId}:`, error.message);
        }
      }
      // If order already has paymentIntent, check its status
      else if (order.paymentIntent) {
        try {
          console.log(`Checking payment intent: ${order.paymentIntent}`);
          const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntent);
          
          if (paymentIntent.status === 'succeeded') {
            // Update order status
            order.paymentStatus = 'paid';
            await order.save();
            
            console.log(`✅ Updated order ${order.orderNumber} to paid status based on payment intent`);
            updatedCount++;
          } else {
            console.log(`⚠️ Payment intent ${order.paymentIntent} status: ${paymentIntent.status}`);
          }
        } catch (error) {
          console.error(`Error fetching payment intent ${order.paymentIntent}:`, error.message);
        }
      }
    }
    
    console.log(`\nCompleted processing. Updated ${updatedCount} of ${pendingOrders.length} orders.`);
  } catch (error) {
    console.error('Error fixing orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixOrders(); 