// server/models/Order.js
// Order model definition
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  customerPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'],
    minlength: [10, 'Phone number must be at least 10 characters'],
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'Kenya',
      trim: true,
    },
  },
  items: [{
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    selectedSize: {
      type: String,
    },
  }],
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
    lowercase: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customerName: 1, createdAt: -1 }); // Compound index for common queries

// Virtual for consistent ID field
OrderSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Instance method to update status
OrderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus.toLowerCase();
  this.updatedAt = new Date();
  return this.save();
};

export default mongoose.model('Order', OrderSchema);