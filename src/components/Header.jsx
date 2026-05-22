import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import BrandLogo from './BrandLogo.jsx';
import './Header.css';
import './BrandLogo.css';

export default function Header() {
  const { cartCount } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header-line" />
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <BrandLogo theme="onDark" size="header" />
        </Link>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>Collection</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)}>Journal</NavLink>
          <NavLink to="/cart" className="nav-cart" onClick={() => setMenuOpen(false)}>
            Bag
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>
        </nav>

        <button
          type="button"
          className={`menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span />
        </button>
      </div>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />}
    </header>
  );
}
