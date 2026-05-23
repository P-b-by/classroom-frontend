import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected securely to MongoDB Atlas Cloud!'))
  .catch(err => console.error('Database connection error:', err));

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
  status: { type: String, default: 'Pending' }
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
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
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
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
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
  return { valid: true };
}

function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
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

// 🔥 FIX: Automatically map database _id to id so your frontend components read it cleanly
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    const formattedProducts = products.map(product => {
      const p = product.toObject();
      p.id = p._id.toString();
      // Ensure name falls back to title if needed by frontend templates
      if (!p.name && p.title) p.name = p.title;
      return p;
    });
    res.json(formattedProducts);
  } catch (err) {
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

app.post('/api/orders', async (req, res) => {
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
    res.status(201).json({ success: true, order });

  } catch (err) {
    console.error('Order Submission Error:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});


app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ ok: true });
  } catch (err) {
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
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Serve frontend assets
const distPath = path.join(__dirname, '../dist');
const indexHtml = path.join(distPath, 'index.html');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
