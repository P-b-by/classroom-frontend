import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import fs from 'fs/promises';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts.js';
import { INITIAL_BLOG_POSTS } from '../src/data/initialBlogPosts.js';
import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');

let dbData = { products: [], orders: [], blog: [], admin: {} };
try {
  const raw = await fs.readFile(DB_FILE, 'utf8');
  dbData = JSON.parse(raw);
} catch (e) {
  // file may not exist yet — we'll seed and write below
}

dbData.products ||= [];
dbData.orders ||= [];
dbData.blog ||= [];
dbData.admin ||= {};

// Seed products and blog posts if empty
if (!dbData.products || dbData.products.length === 0) {
  dbData.products = INITIAL_PRODUCTS.map((p) => ({ ...p }));
}
if (!dbData.blog || dbData.blog.length === 0) {
  dbData.blog = INITIAL_BLOG_POSTS.map((p) => ({ ...p }));
}

async function writeDb() {
  await fs.writeFile(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
}

await writeDb();

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';
const trustProxy = process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true';
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
const cookieSecure = isProduction;
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

if (trustProxy) {
  app.set('trust proxy', 1);
}

app.use(express.json());
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
// Ensure an admin password hash exists (default only if not set)
const rawAdminPassword = process.env.ADMIN_PASSWORD || 'domas2024';
// strip surrounding single or double quotes if present (some editors save with quotes)
const ADMIN_PASSWORD = String(rawAdminPassword).replace(/^"|"$/g, '').replace(/^'|'$/g, '');
if (!dbData.admin.passwordHash) {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  dbData.admin.passwordHash = hash;
}
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Admin auth
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body || {};
  const hash = dbData.admin && dbData.admin.passwordHash;
  if (!password) return res.status(400).json({ ok: false });
  const valid = await bcrypt.compare(password, hash);
  if (valid) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// Products (public read)
app.get('/api/products', (req, res) => {
  res.json(dbData.products || []);
});

// Admin product management
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const product = { ...req.body, id: `prod-${Date.now()}` };
  dbData.products.unshift(product);
  await writeDb();
  res.json(product);
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  dbData.products = dbData.products.map((p) => (p.id === id ? { ...p, ...req.body } : p));
  await writeDb();
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  dbData.products = dbData.products.filter((p) => p.id !== id);
  await writeDb();
  res.json({ ok: true });
});

// Orders
app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(dbData.orders || []);
});

app.post('/api/orders', async (req, res) => {
  const order = { id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), ...req.body };
  dbData.orders.unshift(order);
  await writeDb();
  res.json(order);
});

app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  dbData.orders = dbData.orders.filter((o) => o.id !== id);
  await writeDb();
  res.json({ ok: true });
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  dbData.orders = dbData.orders.map((o) => (o.id === id ? { ...o, status } : o));
  await writeDb();
  res.json({ ok: true });
});

// Blog
app.get('/api/blog', (req, res) => {
  res.json(dbData.blog || []);
});

app.post('/api/admin/blog', requireAdmin, async (req, res) => {
  const post = { ...req.body, id: `blog-${Date.now()}`, publishedAt: new Date().toISOString() };
  dbData.blog.unshift(post);
  await writeDb();
  res.json(post);
});

app.put('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  dbData.blog = dbData.blog.map((p) => (p.id === id ? { ...p, ...req.body } : p));
  await writeDb();
  res.json({ ok: true });
});

app.delete('/api/admin/blog/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  dbData.blog = dbData.blog.filter((p) => p.id !== id);
  await writeDb();
  res.json({ ok: true });
});









// Serve the frontend build directly
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

