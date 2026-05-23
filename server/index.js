import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
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
  items: Array,
  total: Number,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

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

// 🔥 FIX: Increase incoming body parsing limits to handle large Base64 pictures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
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
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
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

// ==========================================
// API ROUTES
// ==========================================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ ok: false });

    const adminRecord = await Admin.findOne({});
    if (!adminRecord) return res.status(500).json({ ok: false, error: 'Admin missing' });

    const valid = await bcrypt.compare(password, adminRecord.passwordHash);
    if (valid) {
      req.session.isAdmin = true;
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ ok: false });
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
    res.status(500).json([]);
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Order failed' });
  }
});

app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/api/blog', async (req, res) => {
  try {
    const posts = await Blog.find({}).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/admin/blog', requireAdmin, async (req, res) => {
  try {
    const post = new Blog({ ...req.body, publishedAt: new Date() });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Post failed' });
  }
});

app.put('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
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
