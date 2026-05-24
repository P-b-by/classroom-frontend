// server/middleware/auth.js
// Authentication middleware
import config from '../config/index.js';
import Admin from '../models/Admin.js';

/**
 * Require admin authentication middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.isAdmin) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Authentication check failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Rate limiting middleware factory
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Express middleware
 */
export const createRateLimiter = (options) => {
  const limiter = new Map();
  const { windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = options;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [timestamp, count] of limiter) {
      if (timestamp < windowStart) {
        limiter.delete(timestamp);
      }
    }

    // Get current request count
    let requestCount = 0;
    for (const [timestamp] of limiter) {
      if (timestamp >= windowStart) {
        requestCount++;
      }
    }

    if (requestCount >= max) {
      return res.status(429).json({
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Record this request
    limiter.set(now, requestCount + 1);
    next();
  };
};