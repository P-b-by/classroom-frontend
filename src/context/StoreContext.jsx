import { createContext, useContext, useEffect, useState } from 'react';
import { slugify } from '../data/initialBlogPosts.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [cart, setCart] = useState([]);
  // `null` = unknown/loading, `false` = not admin, `true` = admin
  const [isAdmin, setIsAdmin] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    // Try to load products from API (if server available) and check admin session
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setProducts(data);
        }
      } catch (e) {
        /* network/server not available - keep local data */
      }

      try {
        const r = await fetch(`${API_BASE}/api/admin/check`, { credentials: 'include' });
        if (r.ok) {
          const j = await r.json();
          setIsAdmin(!!j?.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        // network/server not available - mark as not admin to avoid accidental access
        setIsAdmin(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    // load products and blog from API
    async function load() {
      try {
        const p = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (p.ok) setProducts(await p.json());
      } catch (e) {
        /* ignore */
      }
      try {
        const b = await fetch(`${API_BASE}/api/blog`, { credentials: 'include' });
        if (b.ok) setBlogPosts(await b.json());
      } catch (e) {
        /* ignore */
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
        if (r.ok) setOrders(await r.json());
      } catch (e) {
        /* ignore */
      }
    })();
  }, [isAdmin]);

  const addToCart = (product, size, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === size,
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          quantity,
        },
      ];
    });
  };

  const updateCartQuantity = (productId, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = (customerDetails) => {
    // Handle both old and new customer data structures
    const order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customerName: customerDetails.name || customerDetails.customerName || '',
      customerEmail: customerDetails.email || customerDetails.customerEmail || '',
      customerPhone: customerDetails.phone || customerDetails.customerPhone || '',
      shippingAddress: {
        street: customerDetails.address || customerDetails.shippingAddress?.street || '',
        city: customerDetails.county || customerDetails.shippingAddress?.city || '',
        postalCode: customerDetails.shippingAddress?.postalCode || '',
        country: customerDetails.shippingAddress?.country || 'Kenya'
      },
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    // Try to persist to server
    (async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
          credentials: 'include',
        });
        if (res.ok) {
          const saved = await res.json();
          setOrders((prev) => [saved, ...prev.filter((o) => o.id !== order.id)]);
        }
      } catch (e) {
        /* ignore persistence errors */
      }
    })();
    return order;
  };

  const addProduct = (product) => {
    // If we have a server-admin session, create via API
    if (isAdmin) {
      (async () => {
        try {
          const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
            credentials: 'include',
          });
          if (res.ok) {
            const created = await res.json();
            setProducts((prev) => [created, ...prev]);
            return;
          }
        } catch (e) {
          /* fall back */
        }
        // fallback to local update
        const newProduct = { ...product, id: `prod-${Date.now()}`, price: Number(product.price) };
        setProducts((prev) => [...prev, newProduct]);
      })();
      return;
    }

    const newProduct = { ...product, id: `prod-${Date.now()}`, price: Number(product.price) };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id, updates) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
            credentials: 'include',
          });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, price: updates.price !== undefined ? Number(updates.price) : p.price }
          : p,
      ),
    );
  };

  const deleteProduct = (id) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteOrder = (id) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/orders/${id}`, { method: 'DELETE', credentials: 'include' });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOrderStatus = (id, status) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include',
          });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const loginAdmin = async (password) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      if (res.ok) {
        // Confirm via check endpoint to ensure server-side session was established
        try {
          const check = await fetch(`${API_BASE}/api/admin/check`, { credentials: 'include' });
          if (check.ok) {
            const j = await check.json();
            setIsAdmin(!!j?.isAdmin);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          setIsAdmin(false);
        }
        return true;
      }
    } catch (e) {
      /* network error */
    }
    return false;
  };

  const logoutAdmin = async () => {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      /* ignore */
    }
    setIsAdmin(false);
  };

  const addBlogPost = (post) => {
    const slug = post.slug || slugify(post.title);
    const newPost = { ...post, slug, publishedAt: post.publishedAt || new Date().toISOString() };
    if (isAdmin) {
      (async () => {
        try {
          const res = await fetch('/api/admin/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost),
            credentials: 'include',
          });
          if (res.ok) {
            const created = await res.json();
            setBlogPosts((prev) => [created, ...prev]);
            return;
          }
        } catch (e) {
          /* ignore */
        }
        setBlogPosts((prev) => [newPost, ...prev]);
      })();
      return;
    }
    setBlogPosts((prev) => [newPost, ...prev]);
  };

  const updateBlogPost = (id, updates) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/blog/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
            credentials: 'include',
          });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setBlogPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const title = updates.title ?? p.title;
        return { ...p, ...updates, slug: updates.title ? slugify(title) : p.slug };
      }),
    );
  };

  const deleteBlogPost = (id) => {
    if (isAdmin) {
      (async () => {
        try {
          await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', credentials: 'include' });
        } catch (e) {
          /* ignore */
        }
      })();
    }
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const getBlogPostBySlug = (slug) => blogPosts.find((p) => p.slug === slug);

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        blogPosts,
        cart,
        cartTotal,
        cartCount,
        isAdmin,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteOrder,
        updateOrderStatus,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        getBlogPostBySlug,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
