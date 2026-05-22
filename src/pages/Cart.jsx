import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import './Cart.css';

export default function Cart() {
  const { cart, cartTotal, updateCartQuantity, removeFromCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-hero-bar">
          <div className="container">
            <h1 className="page-title">Your Bag</h1>
          </div>
        </div>
        <div className="container">
          <div className="empty-state cart-empty">
            <h2>Your bag is empty</h2>
            <p>Explore our collection to find your next pair.</p>
            <Link to="/products" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
              View Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-hero-bar">
        <div className="container">
          <span className="section-label">Checkout</span>
          <h1 className="page-title">Your Bag</h1>
          <div className="gold-line" />
          <p className="page-subtitle">
            {cart.length} item{cart.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      </div>

      <div className="container cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <span className="cart-item-size">Size {item.size}</span>
                <p className="cart-item-unit">KES {item.price.toLocaleString()} each</p>
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button type="button" onClick={() => updateCartQuantity(item.productId, item.size, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateCartQuantity(item.productId, item.size, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-line-total">KES {(item.price * item.quantity).toLocaleString()}</p>
                <button type="button" className="remove-btn" onClick={() => removeFromCart(item.productId, item.size)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>KES {cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>KES {cartTotal.toLocaleString()}</span>
          </div>
          <Link to="/checkout" className="btn btn-gold checkout-btn">Proceed to Checkout</Link>
          <Link to="/products" className="continue-link">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
