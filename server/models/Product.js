// server/models/Product.js
// Product model definition
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  sizes: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text' }); // Full-text search

// Virtual for consistent ID field
ProductSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Product', ProductSchema);