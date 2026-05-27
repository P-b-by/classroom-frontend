import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { CATEGORIES } from '../../data/initialProducts.js';
import ImageUpload from '../../components/ImageUpload.jsx';

const EMPTY_FORM = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  description: '',
  image: '',
  sizes: '',
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || product.title, // Handle both name and title fields
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image,
      sizes: product.sizes.join(', '),
    });
    setEditingId(product.id);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.image?.trim()) {
      setFormError('Please upload an image or paste an image URL.');
      return;
    }

    const sizes = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      title: form.name, // API expects 'title' field
      name: form.name,
      category: form.category,
      price: form.price,
      description: form.description,
      image: form.image.trim(),
      sizes: sizes.length ? sizes : ['40'],
    };

    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }

    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Manage Products</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
            Add, edit, or remove products — upload photos with drag &amp; drop
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="admin-form-panel">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <ImageUpload
              label="Product Photo *"
              value={form.image}
              onChange={(image) => {
                setForm((prev) => ({ ...prev, image }));
                setFormError('');
              }}
            />

            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (KES) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Sizes (comma-separated) *</label>
                <input
                  required
                  placeholder="39, 40, 41, 42"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {formError && <p className="admin-form-error">{formError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn btn-gold">
                {editingId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sizes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.image} alt={p.name} className="admin-thumb" />
                </td>
                <td><strong>{p.name}</strong></td>
                <td><span className="badge badge-gold">{p.category}</span></td>
                <td>KES {p.price.toLocaleString()}</td>
                <td>{p.sizes.join(', ')}</td>
                <td className="action-cell">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .admin-form-panel {
          background: var(--white);
          padding: 1.5rem;
          border: 1px solid var(--ivory-dark);
          margin-bottom: 1.5rem;
        }
        .admin-form-panel h3 {
          font-family: var(--font-serif);
          margin-bottom: 1.25rem;
        }
        .admin-form-error {
          color: #c45c5c;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .admin-table-wrap {
          overflow-x: auto;
          background: var(--white);
          border: 1px solid var(--ivory-dark);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .admin-table th,
        .admin-table td {
          padding: 0.85rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--ivory-dark);
        }
        .admin-table th {
          background: var(--black);
          color: var(--white);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .admin-thumb {
          width: 52px;
          height: 52px;
          object-fit: cover;
        }
        .action-cell {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
