// server/config/index.js
// Centralized configuration management
import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 4000,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  database: {
    uri: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/classroom',
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    },
  },

  // Security
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    adminPassword: process.env.ADMIN_PASSWORD || 'domas2024',
    trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
    bcryptRounds: 10,
    rateLimiting: {
      authWindowMs: 15 * 60 * 1000,
      authMax: 5,
      generalWindowMs: 15 * 60 * 1000,
      generalMax: 100,
      orderWindowMs: 15 * 60 * 1000,
      orderMax: 10,
    },
  },

  // CORS
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:5173'],
    credentials: true,
    sameSite: process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    secure: process.env.NODE_ENV === 'production',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: `"Domas Ventures" <${process.env.EMAIL_USER || ''}>`,
  },

  // Validation
  validation: {
    maxNameLength: 100,
    maxDescriptionLength: 5000,
    maxPhoneLength: 20,
    maxEmailLength: 255,
    minPasswordLength: 12,
  },

  // Features
  features: {
    emailNotifications: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    rateLimiting: true,
    securityHeaders: true,
    requestLogging: true,
  },
};

// Validate required configuration in production
if (config.isProduction) {
  const required = ['database.uri', 'security.sessionSecret'];
  const missing = required.filter(key => !config[key.split('.').reduce((obj, k) => obj?.[k], config)]);
  
  if (missing.length > 0) {
    console.error(`Missing required configuration in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export default config;