import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  
  // 🔹 Safe Check 1: Use optional chaining (?.) and fallback to empty array if sizes is missing
  const productSizes = product.sizes || [];
  const [size, setSize] = useState(productSizes[0] || '');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!size) return;
    addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="product-price">
          <span className="currency">KES</span>
          {(product.price || 0).toLocaleString()}
        </p>
        
        {/* 🔹 Safe Check 2: Only show the sizes container if the product actually has sizes */}
        {productSizes.length > 0 && (
          <div className="size-row">
            {productSizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`size-btn ${size === s ? 'is-active' : ''}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className={`product-add ${added ? 'is-added' : ''}`}
          onClick={handleAdd}
          disabled={productSizes.length > 0 && !size} // Disable if sizes exist but none is picked
        >
          {added ? 'Added' : 'Add to Bag'}
        </button>
      </div>
    </article>
  );
}
