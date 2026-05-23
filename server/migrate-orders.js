#!/usr/bin/env node
import mongoose from 'mongoose';
import 'dotenv/config';

// Define the Order Schema to access existing orders
const OrderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    selectedSize: String
  }],
  total: Number,
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

async function migrateOrderStatuses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/classroom';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all orders with uppercase status values
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);

    let updatedCount = 0;
    
    for (const order of orders) {
      if (order.status) {
        const originalStatus = order.status;
        const normalizedStatus = order.status.toLowerCase();
        
        if (originalStatus !== normalizedStatus) {
          await Order.findByIdAndUpdate(order._id, { status: normalizedStatus });
          console.log(`Updated order ${order._id} status from "${originalStatus}" to "${normalizedStatus}"`);
          updatedCount++;
        }
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} orders.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateOrderStatuses();