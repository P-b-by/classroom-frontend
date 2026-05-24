import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts.js';
import { INITIAL_BLOG_POSTS } from '../src/data/initialBlogPosts.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';
const trustProxy = process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true';
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
const cookieSecure = isProduction;
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

// Connect to MongoDB Atlas Cloud Database
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/classroom';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected securely to MongoDB Atlas Cloud!'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending function
async function sendOrderConfirmationEmail(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured, skipping email');
    return;
  }

  if (!order.customerEmail) {
    console.log('No customer email provided, skipping email');
    return;
  }

  const isConfirmed = order.status === 'confirmed' || order.status === 'Confirmed';
  const emailTitle = isConfirmed ? 'Order Confirmed' : 'Order Received';
  const emailMessage = isConfirmed 
    ? 'We\'re pleased to confirm that your order has been confirmed and is being processed.'
    : 'We\'ve received your order and we\'ll process it shortly.';

  const mailOptions = {
    from: `"Domas Ventures" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `${emailTitle} - Domas Ventures`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #c59d3b; margin: 0; font-size: 28px;">Domas Ventures</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0;">Luxury Footwear</p>
        </div>
        <div style="background: #f8f6f3; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0a0a0a; margin-top: 0;">${emailTitle}!</h2>
          <p style="color: #666;">Dear ${order.customerName},</p>
          <p style="color: #666;">${emailMessage} Thank you for shopping with Domas Ventures.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h3 style="color: #0a0a0a; margin-top: 0;">Order Details:</h3>
            <p style="color: #666;"><strong>Order ID:</strong> ${order._id?.slice(-6).toUpperCase() || order.id?.slice(-6).toUpperCase() || 'N/A'}</p>
            <p style="color: #666;"><strong>Total:</strong> KES ${(order.total || 0).toLocaleString()}</p>
            <p style="color: #666;"><strong>Status:</strong> ${order.status || 'Pending'}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <h3 style="color: #0a0a0a; margin-top: 0;">Delivery Information:</h3>
            <p style="color: #666;"><strong>Address:</strong> ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || 'N/A'}</p>
            <p style="color: #666;"><strong>Expected Delivery:</strong> Within 3 business days</p>
          </div>

          ${isConfirmed ? `
          <div style="background: linear-gradient(135deg, #c59d3b 0%, #e6d39a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #0a0a0a; margin: 0; font-weight: bold;">🎉 Your order has been confirmed! We'll ship it to you within 3 business days.</p>
          </div>
          ` : ''}

          <p style="color: #666;">If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">© 2026 Domas Ventures. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Database Schemas & Models
const ProductSchema = new mongoose.Schema({
  title: String,
  name: String,        // Added to match frontend 'product.name' if utilized
  price: Number,
  description: String,
  image: String,
  category: String,
  sizes: { type: [String], default: [] } // Fixes undefined array mapping errors on frontend
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  // Customer Demographics
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  // Product & Financial details
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    selectedSize: String
  }],
  total: Number,
  status: { type: String, default: 'pending' }
}, { 
  timestamps: true // Automatically tracks 'createdAt' (Order Placement Time) and 'updatedAt'
});


const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
  passwordHash: String
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Blog = mongoose.model('Blog', BlogSchema);
const Admin = mongoose.model('Admin', AdminSchema);

// Data Seeding Function for Cloud Empty States
async function seedDatabaseAndAdmin() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS.map((p) => ({ ...p })));
      console.log('🌱 Seeded default products to MongoDB.');
    }

    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany(INITIAL_BLOG_POSTS.map((p) => ({ ...p })));
      console.log('🌱 Seeded default blog posts to MongoDB.');
    }

    const rawAdminPassword = process.env.ADMIN_PASSWORD || 'domas2024';
    const ADMIN_PASSWORD = String(rawAdminPassword).replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    
    const existingAdmin = await Admin.findOne({});
    if (!existingAdmin) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const newAdmin = new Admin({ passwordHash: hash });
      await newAdmin.save();
      console.log('🎉 Default admin account initialized in MongoDB.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

mongoose.connection.once('open', () => {
  seedDatabaseAndAdmin();
});

if (trustProxy) {
  app.set('trust proxy', 1);
}

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Body size limits to prevent DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for order creation
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 orders per windowMs
  message: 'Too many orders from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔥 FIX: Increase incoming body parsing limits to handle large Base64 pictures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin denied: ${origin}`), false);
    },
    credentials: true,
  }),
);




app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: true,              // Forced session update saving
    saveUninitialized: true,   // Forced session initialization tracking
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/classroom',
    }),
    cookie: {
      httpOnly: true,
      secure: cookieSecure,    // Use configured secure flag based on environment
      sameSite: cookieSameSite, // Use configured sameSite policy
      maxAge: 1000 * 60 * 60 * 2, // Reduced to 2 hours for better security
    },
  }),
);



console.log('Backend config:');
console.log(`  NODE_ENV=${process.env.NODE_ENV}`);
console.log(`  CORS_ALLOWED_ORIGINS=${allowedOrigins.join(', ')}`);
console.log(`  COOKIE_SAME_SITE=${cookieSameSite}`);
console.log(`  TRUST_PROXY=${trustProxy}`);

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Input validation helpers
function validatePassword(password) {
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
}

function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  // Enhanced XSS prevention - remove potentially dangerous characters and patterns
  return input.trim()
    .replace(/[<>]/g, '') // Remove angle tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .substring(0, 1000); // Limit length to prevent DoS
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 10;
}

function validateObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId validation
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// ==========================================
// API ROUTES
// ==========================================

// Global error handler to prevent information leakage
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  // Don't leak error details to client in production
  if (isProduction) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message });
  }
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Validate Content-Type for POST/PUT requests
app.use('/api/', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
    // Check content-length to prevent oversized requests
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB
      return res.status(413).json({ error: 'Request entity too large' });
    }
  }
  next();
});

// Apply stricter rate limiting to auth endpoints
app.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ ok: false, error: 'Password is required' });

    const adminRecord = await Admin.findOne({});
    if (!adminRecord) return res.status(500).json({ ok: false, error: 'Authentication failed' });

    const valid = await bcrypt.compare(password, adminRecord.passwordHash);
    if (valid) {
      req.session.isAdmin = true;
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Authentication failed' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ ok: false, error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection with a simple operation
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🔥 FIX: Automatically map database _id to id so your frontend components read it cleanly
app.get('/api/products', async (req, res) => {
  try {
    console.log('Attempting to fetch products from database...');
    const products = await Product.find({})
      .sort({ _id: -1 })
      .limit(50)
      .lean()
      .timeout(5000) // 5 second timeout
      .exec();
    
    console.log(`Found ${products.length} products`);
    
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      title: product.title,
      name: product.name || product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      sizes: product.sizes || [],
      createdAt: product.createdAt
    }));
    
    res.json(formattedProducts);
  } catch (err) {
    console.error('Failed to retrieve products:', err);
    // For development, return empty array if database query fails
    // This allows the frontend to function while we debug the query issue
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const { title, name, price, description, category, sizes, image } = req.body || {};
    
    // Input validation
    if (!title || !sanitizeString(title)) {
      return res.status(400).json({ error: 'Product title is required' });
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!category || !sanitizeString(category)) {
      return res.status(400).json({ error: 'Product category is required' });
    }
    
    const product = new Product({
      title: sanitizeString(title),
      name: name ? sanitizeString(name) : sanitizeString(title),
      price: Number(price),
      description: description ? sanitizeString(description) : '',
      category: sanitizeString(category),
      sizes: Array.isArray(sizes) ? sizes.map(s => sanitizeString(s)) : [],
      image: image || ''
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { title, name, price, description, category, sizes, image } = req.body || {};
    const updateData = {};
    
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (name !== undefined) updateData.name = sanitizeString(name);
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = sanitizeString(description);
    if (category !== undefined) updateData.category = sanitizeString(category);
    if (sizes !== undefined) updateData.sizes = Array.isArray(sizes) ? sizes.map(s => sanitizeString(s)) : [];
    if (image !== undefined) updateData.image = image;
    
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, total } = req.body || {};

    // 1. Validation Checks
    if (!customerName || !sanitizeString(customerName)) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!customerPhone || !validatePhoneNumber(customerPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cannot place an empty order' });
    }

    if (!total || isNaN(total) || Number(total) <= 0) {
      return res.status(400).json({ error: 'Invalid order total' });
    }

    // 2. Sanitize and save order data
    const order = new Order({
      customerName: sanitizeString(customerName),
      customerEmail: customerEmail ? sanitizeString(customerEmail) : '',
      customerPhone: sanitizeString(customerPhone),
      shippingAddress: {
        street: sanitizeString(shippingAddress.street),
        city: sanitizeString(shippingAddress.city),
        postalCode: shippingAddress.postalCode ? sanitizeString(shippingAddress.postalCode) : '',
        country: shippingAddress.country ? sanitizeString(shippingAddress.country) : 'Kenya'
      },
      items: items.map(item => ({
        productId: item.productId ? sanitizeString(item.productId) : '',
        name: item.name ? sanitizeString(item.name) : '',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        selectedSize: item.selectedSize ? sanitizeString(item.selectedSize) : ''
      })),
      total: Number(total)
    });

    await order.save();
    
    // Send order received email
    await sendOrderConfirmationEmail(order);
    
    res.status(201).json({ success: true, order });

  } catch (err) {
    console.error('Order Submission Error:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});


app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId (also support client-generated IDs)
    const orderId = req.params.id;
    if (orderId.includes('ORD-')) {
      // Client-generated ID, skip ObjectId validation
    } else if (!validateObjectId(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId (also support client-generated IDs)
    const orderId = req.params.id;
    if (orderId.includes('ORD-')) {
      // Client-generated ID, skip ObjectId validation
    } else if (!validateObjectId(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (status === 'confirmed' || status === 'Confirmed') {
      // Send confirmation email when order is confirmed
      await sendOrderConfirmationEmail(order);
    }
    
    res.json({ ok: true, order });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.get('/api/blog', async (req, res) => {
  try {
    const posts = await Blog.find({}).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

app.post('/api/admin/blog', requireAdmin, async (req, res) => {
  try {
    const { title, content, author, category, image } = req.body || {};
    
    // Input validation
    if (!title || !sanitizeString(title)) {
      return res.status(400).json({ error: 'Blog post title is required' });
    }
    if (!content || !sanitizeString(content)) {
      return res.status(400).json({ error: 'Blog post content is required' });
    }
    if (!author || !sanitizeString(author)) {
      return res.status(400).json({ error: 'Author is required' });
    }
    
    const post = new Blog({ 
      title: sanitizeString(title),
      content: sanitizeString(content),
      author: sanitizeString(author),
      category: category ? sanitizeString(category) : 'General',
      image: image || '',
      publishedAt: new Date()
    });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

app.put('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid blog post ID' });
    }

    const { title, content, author, category, image } = req.body || {};
    const updateData = {};
    
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (content !== undefined) updateData.content = sanitizeString(content);
    if (author !== undefined) updateData.author = sanitizeString(author);
    if (category !== undefined) updateData.category = sanitizeString(category);
    if (image !== undefined) updateData.image = image;
    
    await Blog.findByIdAndUpdate(req.params.id, updateData);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

app.delete('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid blog post ID' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Serve frontend assets
const distPath = path.join(__dirname, '../dist');
const indexHtml = path.join(distPath, 'index.html');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Serving frontend from dist directory');
} else {
  console.warn('Dist directory not found, frontend may not be built');
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(500).json({ error: 'Frontend not built - please run npm run build' });
  }
});

// Global error handler - must be after all routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Only start server after database connection is established
mongoose.connection.once('connected', () => {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
