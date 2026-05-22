import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import './Footer.css';
import './BrandLogo.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line" />
      <div className="container footer-main">
        <div className="footer-brand">
          <BrandLogo theme="onDark" size="footer" />
        </div>
        <div className="footer-col">
          <h4>Navigate</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Collection</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/cart">Bag</Link>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <Link to="/products?category=Sneakers">Sneakers</Link>
          <Link to="/products?category=Official%20Shoes">Official</Link>
          <Link to="/products?category=School%20Shoes">School</Link>
          <Link to="/products?category=Sandals">Sandals</Link>
        </div>
        <div className="footer-col footer-contact">
          <h4>Kenya</h4>
          <p>Delivery to all 47 counties</p>
          <p className="footer-values">Quality · Integrity · Affordability</p>
        </div>
      </div>
      <div className="footer-base">
        <div className="container footer-base-inner">
          <span>© {new Date().getFullYear()} Domas Ventures</span>
          <span className="gold-rule">Ventures</span>
        </div>
      </div>
    </footer>
  );
}
