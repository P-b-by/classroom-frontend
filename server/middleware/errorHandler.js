// server/middleware/errorHandler.js
// Error handling middleware
import logger from '../utils/logger.js';
import { errorResponse, AppError } from '../utils/index.js';

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  logger.logError(err, req);

  // Handle operational errors (expected errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle rate limiting errors
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: err.message,
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle 404 Not Found
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle 401 Unauthorized
  if (err.code === 'AUTH_REQUIRED' || err.code === 'AUTH_ERROR') {
    return res.status(401).json({
      success: false,
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle 403 Forbidden
  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden',
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    });
  }

  // Generic error handler for unexpected errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async route wrapper to eliminate try-catch blocks
 * @param {Function} fn - Async function
 * @returns {Function} - Express middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};