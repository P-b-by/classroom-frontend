// server/middleware/validation.js
// Input validation middleware
import {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateObjectId,
  sanitizeString,
  errorResponse,
} from '../utils/index.js';
import config from '../config/index.js';

/**
 * Validate request body against schema
 * @param {Object} schema - Validation schema
 * @returns {Function} - Express middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Required validation
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if field is not required and not provided
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      }
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
      }

      // Range validation (numbers)
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} cannot exceed ${rules.max}`);
      }

      // Email validation
      if (rules.email && !validateEmail(value)) {
        errors.push(`${field} must be a valid email`);
      }

      // Phone validation
      if (rules.phone && !validatePhoneNumber(value)) {
        errors.push(`${field} must be a valid phone number`);
      }

      // Custom validation function
      if (rules.validate && !rules.validate(value)) {
        errors.push(`${field} is invalid`);
      }

      // Sanitization for string fields
      if (rules.sanitize && typeof value === 'string') {
        req.body[field] = sanitizeString(value, rules.maxLength);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }

    next();
  };
};

/**
 * Validate ObjectId parameter
 * @param {string} param - Parameter name
 * @returns {Function} - Express middleware
 */
export const validateIdParam = (param = 'id') => {
  return (req, res, next) => {
    const id = req.params[param];
    
    // Skip validation for client-generated IDs (starting with ORD-)
    if (id && id.startsWith('ORD-')) {
      return next();
    }
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${param} format`,
        code: 'INVALID_ID',
      });
    }
    
    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  product: {
    title: { type: 'string', required: true, maxLength: 100, sanitize: true },
    name: { type: 'string', maxLength: 100, sanitize: true },
    price: { type: 'number', required: true, min: 0 },
    description: { type: 'string', maxLength: 5000, sanitize: true },
    category: { type: 'string', required: true, sanitize: true },
    sizes: { type: 'array' },
    image: { type: 'string' },
  },

  order: {
    customerName: { type: 'string', required: true, maxLength: 100, sanitize: true },
    customerEmail: { type: 'string', email: true },
    customerPhone: { type: 'string', required: true, phone: true },
    'shippingAddress.street': { type: 'string', required: true, sanitize: true },
    'shippingAddress.city': { type: 'string', required: true, sanitize: true },
    'shippingAddress.postalCode': { type: 'string', sanitize: true },
    'shippingAddress.country': { type: 'string', sanitize: true },
    items: { type: 'array', required: true },
    total: { type: 'number', required: true, min: 0 },
  },

  blog: {
    title: { type: 'string', required: true, maxLength: 200, sanitize: true },
    content: { type: 'string', required: true, sanitize: true },
    author: { type: 'string', required: true, maxLength: 100, sanitize: true },
    category: { type: 'string', sanitize: true },
    image: { type: 'string' },
  },

  password: {
    password: { type: 'string', required: true, validate: (val) => validatePassword(val).valid },
  },
};