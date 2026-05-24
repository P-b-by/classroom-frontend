// server/models/Blog.js
// Blog model definition
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ category: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ title: 'text', content: 'text' }); // Full-text search

// Virtual for consistent ID field
BlogSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Blog', BlogSchema);