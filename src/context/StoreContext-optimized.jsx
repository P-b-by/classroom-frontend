// src/context/StoreContext.jsx (Optimized Version)
// Optimized state management for scalability
import { createContext, useContext, useEffect, useState } from 'react';
import { slugify } from '../data/initialBlogPosts.js';

const StoreContext = createContext(null);

// Constants
const API_BASE = import.meta.env.VITE_API_URL || '';
const CART_STORAGE_KEY = 'domas_cart';

// Helper functions
const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export function StoreProvider({ children }) {
  // State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    products: false,
    orders: false,
    blogPosts: false,
  });
  
  // Error states
  const [errors, setErrors] = useState({
    products: null,
    orders: null,
    blogPosts: null,
  });

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = loadFromStorage(CART_STORAGE_KEY, []);
    setCart(savedCart);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    saveToStorage(CART_STORAGE_KEY, cart);
  }, [cart]);

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load products
  const loadProducts = async () => {
    setIsLoading(prev => ({ ...prev, products: true }));
    setErrors(prev => ({ ...prev, products: null }));

    try {
      const data = await apiCall('/api/products');
      if (Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, products: error.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Load orders (admin only)
  const loadOrders = async () => {
    if (isAdmin !== true) return;

    setIsLoading(prev => ({ ...prev, orders: true }));
    setErrors(prev => ({ ...prev, orders: null }));

    try {
      const data = await apiCall('/api/orders');
      if (Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, orders: error.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Load blog posts
  const loadBlogPosts = async () => {
    setIsLoading(prev => ({ ...prev, blogPosts: true }));
    setErrors(prev => ({ ...prev, blogPosts: null }));

    try {
      const data = await apiCall('/api/blog');
      if (Array.isArray(data.data)) {
        setBlogPosts(data.data);
      } else if (Array.isArray(data)) {
        setBlogPosts(data);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, blogPosts: error.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, blogPosts: false }));
    }
  };

  // Check admin status
  const checkAdminStatus = async () => {
    try {
      const data = await apiCall('/api/admin/check');
      setIsAdmin(data.isAdmin === true);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      await loadProducts();
      await loadBlogPosts();
      await checkAdminStatus();
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Load orders when admin status changes
  useEffect(() => {
    if (isAdmin === true) {
      loadOrders();
    }
  }, [isAdmin]);

  // Cart operations
  const addToCart = (product, size, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.productId === product.id && item.size === size
      );
      
      if (existing) {
        return prev.map(item =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity,
      }];
    });
  };

  const updateCartQuantity = (productId, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCart(prev =>
      prev.filter(item => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => setCart([]);

  // Derived state
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Place order
  const placeOrder = async (customerDetails) => {
    const order = {
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        selectedSize: item.size,
      })),
      total: cartTotal,
      customerName: customerDetails.name || customerDetails.customerName || '',
      customerEmail: customerDetails.email || customerDetails.customerEmail || '',
      customerPhone: customerDetails.phone || customerDetails.customerPhone || '',
      shippingAddress: {
        street: customerDetails.address || customerDetails.shippingAddress?.street || '',
        city: customerDetails.county || customerDetails.shippingAddress?.city || '',
        postalCode: customerDetails.shippingAddress?.postalCode || '',
        country: customerDetails.shippingAddress?.country || 'Kenya',
      },
    };

    // Optimistic update
    setOrders(prev => [{ ...order, id: `ORD-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...prev]);
    clearCart();

    try {
      const response = await apiCall('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });

      // Update with server response
      if (response.success && response.order) {
        setOrders(prev => [
          response.order,
          ...prev.filter(o => o.id !== `ORD-${Date.now()}`)
        ]);
      }

      return response.order;
    } catch (error) {
      // Rollback optimistic update
      setCart(cart);
      throw error;
    }
  };

  // Admin operations
  const deleteProduct = async (id) => {
    if (!isAdmin) return;

    try {
      await apiCall(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  const updateProduct = async (id, updates) => {
    if (!isAdmin) return;

    try {
      await apiCall(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      setProducts(prev =>
        prev.map(p =>
          (p._id || p.id) === id
            ? { ...p, ...updates, price: updates.price !== undefined ? Number(updates.price) : p.price }
            : p
        )
      );
    } catch (error) {
      console.error('Update product error:', error);
    }
  };

  const deleteOrder = async (id) => {
    if (!isAdmin) return;

    try {
      const orderId = id.includes('ORD-') ? id : id;
      await apiCall(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => (o._id || o.id) !== id));
    } catch (error) {
      console.error('Delete order error:', error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    if (!isAdmin) return;

    try {
      const orderId = id.includes('ORD-') ? id : id;
      const response = await apiCall(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(prev =>
          prev.map(o => (o._id || o.id) === id ? { ...o, status } : o)
        );
      }
    } catch (error) {
      console.error('Update order status error:', error);
    }
  };

  // Blog operations
  const addBlogPost = async (post) => {
    if (!isAdmin) return;

    const slug = post.slug || slugify(post.title);
    const newPost = { ...post, slug, publishedAt: post.publishedAt || new Date().toISOString() };

    try {
      const response = await apiCall('/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify(newPost),
      });
      
      if (response.success || response.data) {
        setBlogPosts(prev => [response.data || response, ...prev]);
      }
    } catch (error) {
      console.error('Add blog post error:', error);
      // Fallback to local update
      setBlogPosts(prev => [newPost, ...prev]);
    }
  };

  const updateBlogPost = async (id, updates) => {
    if (!isAdmin) return;

    try {
      await apiCall(`/api/admin/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      setBlogPosts(prev =>
        prev.map(p => (p._id || p.id) === id ? { ...p, ...updates } : p)
      );
    } catch (error) {
      console.error('Update blog post error:', error);
    }
  };

  const deleteBlogPost = async (id) => {
    if (!isAdmin) return;

    try {
      await apiCall(`/api/admin/blog/${id}`, { method: 'DELETE' });
      setBlogPosts(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (error) {
      console.error('Delete blog post error:', error);
    }
  };

  // Admin authentication
  const loginAdmin = async (password) => {
    try {
      await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      
      await checkAdminStatus();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      await apiCall('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAdmin(false);
  };

  // Context value
  const value = {
    // State
    products,
    orders,
    blogPosts,
    cart,
    isAdmin,
    isLoading,
    errors,

    // Computed values
    cartTotal,
    cartCount,

    // Actions
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    loadProducts,
    loadOrders,
    loadBlogPosts,
    deleteProduct,
    updateProduct,
    deleteOrder,
    updateOrderStatus,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    loginAdmin,
    logoutAdmin,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}