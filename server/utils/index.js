// server/utils/index.js
// Utility functions for the application
import mongoose from 'mongoose';

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitizes string input to prevent XSS
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return '';
  return input.trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\(/gi, '')
    .substring(0, maxLength);
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 255;
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 10 && phone.trim().length <= 20;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with valid boolean and error message
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
};

/**
 * Async handler for Express routes to reduce try-catch boilerplate
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standard success response format
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
export const successResponse = (data = null, message = 'Success', statusCode = 200) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted error response
 */
export const errorResponse = (message = 'Internal server error', code = 'INTERNAL_ERROR', statusCode = 500) => ({
  success: false,
  error: message,
  code,
  timestamp: new Date().toISOString(),
});

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Paginate results
 * @param {Array} results - Array to paginate
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated result
 */
export const paginate = (results, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: results.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
      hasNext: endIndex < results.length,
      hasPrev: startIndex > 0,
    },
  };
};

/**
 * Format product data for API response
 * @param {Object} product - Mongoose product document
 * @returns {Object} - Formatted product
 */
export const formatProduct = (product) => {
  const p = product.toObject ? product.toObject() : product;
  return {
    id: p._id?.toString() || p.id,
    title: p.title,
    name: p.name || p.title,
    price: p.price,
    description: p.description,
    image: p.image,
    category: p.category,
    sizes: p.sizes || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * Format order data for API response
 * @param {Object} order - Mongoose order document
 * @returns {Object} - Formatted order
 */
export const formatOrder = (order) => {
  const o = order.toObject ? order.toObject() : order;
  return {
    id: o._id?.toString() || o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    items: o.items || [],
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

/**
 * Format blog post data for API response
 * @param {Object} post - Mongoose blog post document
 * @returns {Object} - Formatted blog post
 */
export const formatBlogPost = (post) => {
  const p = post.toObject ? post.toObject() : post;
  return {
    id: p._id?.toString() || p.id,
    title: p.title,
    content: p.content,
    author: p.author,
    category: p.category,
    image: p.image,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * Sleep function for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after timeout
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));