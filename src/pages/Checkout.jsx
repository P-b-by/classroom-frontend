import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { KENYA_COUNTIES } from '../data/kenyaCounties.js';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, placeOrder } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    phone: '',
    email: '',
    county: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  if (cart.length === 0 && !submitted) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <div className="empty-state">
            <h2>No items to checkout</h2>
            <Link to="/products" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
              Go to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="checkout-page">
        <div className="container checkout-success-wrap">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2 className=''>Order Placed Successfully!</h2>
            <p>
              Your order has been placed. We will contact you to confirm on the shipment.
            </p>
            <p className="success-note">Thank you for choosing Domas Ventures.</p>
            <Link to="/products" className="btn btn-gold">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    
    // Name validation
    if (!form.name.trim()) {
      errs.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (/<[^>]*>/.test(form.name)) {
      errs.name = 'Name contains invalid characters';
    }
    
    // Gender validation
    if (!form.gender) errs.gender = 'Please select your gender';
    
    // Phone validation
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(form.phone)) {
      errs.phone = 'Invalid phone number format';
    } else if (form.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }
    
    // Email validation (optional but must be valid if provided)
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email format';
    }
    
    // County validation
    if (!form.county) errs.county = 'Please select your county';
    
    // Address validation
    if (!form.address.trim()) {
      errs.address = 'Delivery address is required';
    } else if (form.address.trim().length < 10) {
      errs.address = 'Please provide a complete delivery address';
    } else if (/<[^>]*>/.test(form.address)) {
      errs.address = 'Address contains invalid characters';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    placeOrder(form);
    setSubmitted(true);
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="checkout-page">
      <div className="page-hero-bar">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--gold)' }}>Almost there</span>
          <h1 className="page-title">Complete Your Order</h1>
          <div className="gold-line" />
          <p className="page-subtitle">Enter your details for delivery across Kenya</p>
        </div>
      </div>

      <div className="container checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Your full name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <span className="field-error">{errors.gender}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="0712 345 678"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Delivery Location</h3>
            <div className="form-group">
              <label htmlFor="county">County (Kenya) *</label>
              <select
                id="county"
                value={form.county}
                onChange={(e) => update('county', e.target.value)}
              >
                <option value="">Select your county</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.county && <span className="field-error">{errors.county}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="address">Delivery Address *</label>
              <textarea
                id="address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Street, town, building, landmark..."
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-gold place-order-btn">
            Place Order — KES {cartTotal.toLocaleString()}
          </button>
        </form>

        <aside className="checkout-summary">
          <h3>Your Order</h3>
          <ul className="checkout-items">
            {cart.map((item) => (
              <li key={`${item.productId}-${item.size}`}>
                <img src={item.image} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <span>Size {item.size} × {item.quantity}</span>
                </div>
                <span className="item-price">
                  KES {(item.price * item.quantity).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout-total">
            <span>Total</span>
            <span>KES {cartTotal.toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
