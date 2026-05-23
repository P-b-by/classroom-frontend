import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { CATEGORIES } from '../data/initialProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import './Products.css';

export default function Products() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, search]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="shop-page">
      <div className="page-hero-bar">
        <div className="container">
          <span className="section-label">The Collection</span>
          <h1 className="page-title">Footwear</h1>
          <div className="gold-line" />
          <p className="page-subtitle">
            Every style crafted for comfort, confidence, and lasting impression.
          </p>
        </div>
      </div>

      <div className="container shop-layout">
        <aside className="shop-sidebar">
          <div className="sidebar-block">
            <h3>Search</h3>
            <div className="search-field">
              <input
                type="search"
                placeholder="Find a style..."
                value={search}
                onChange={(e) => setFilter('q', e.target.value)}
              />
            </div>
          </div>
          <div className="sidebar-block">
            <h3>Category</h3>
            <ul className="category-filters">
              <li>
                <button
                  className={!categoryFilter ? 'active' : ''}
                  onClick={() => setFilter('category', '')}
                >
                  All <span>{products.length}</span>
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={categoryFilter === cat ? 'active' : ''}
                    onClick={() => setFilter('category', cat)}
                  >
                    {cat}
                    <span>{products.filter((p) => p.category === cat).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <p>
              <strong>{filtered.length}</strong> piece{filtered.length !== 1 ? 's' : ''}
              {categoryFilter && <> · {categoryFilter}</>}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state shop-empty">
              <h3>No pieces found</h3>
              <p>Adjust your filters to explore more.</p>
              <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => setSearchParams({})}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-products">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
