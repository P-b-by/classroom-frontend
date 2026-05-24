// server/models/Admin.js
// Admin model definition
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  passwordHash: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Instance method to check if account is locked
AdminSchema.methods.isLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
};

// Instance method to increment login attempts
AdminSchema.methods.incrementLoginAttempts = function() {
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  return this.save();
};

// Instance method to reset login attempts
AdminSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockedUntil = undefined;
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('Admin', AdminSchema);