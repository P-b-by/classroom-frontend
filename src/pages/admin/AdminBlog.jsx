import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';

const EMPTY = {
  title: '',
  excerpt: '',
  content: '',
  image: '',
  author: 'Domas Ventures Team',
  category: 'Guides',
};

const CATEGORIES = ['Guides', 'Style', 'Business', 'News'];

export default function AdminBlog() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (post) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      author: post.author,
      category: post.category,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateBlogPost(editingId, form);
    } else {
      addBlogPost(form);
    }
    setShowForm(false);
    setForm(EMPTY);
    setEditingId(null);
  };

  const handleDelete = (id, title) => {
    console.log('handleDelete called with ID:', id, 'and title:', title);
    if (window.confirm(`Delete "${title}"?`)) {
      console.log('User confirmed deletion for ID:', id);
      deleteBlogPost(id);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="page-title">Blog Articles</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
            Create and manage journal posts for the storefront
          </p>
        </div>
        <button type="button" className="btn btn-gold" onClick={openAdd}>
          + New Article
        </button>
      </div>

      {showForm && (
        <div className="admin-form-panel">
          <h3>{editingId ? 'Edit Article' : 'New Article'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Excerpt *</label>
              <textarea
                required
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Content * (use **bold** for emphasis, blank line between paragraphs)</label>
              <textarea
                required
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <ImageUpload
              label="Cover Image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-gold">
                {editingId ? 'Save Changes' : 'Publish'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap" style={{ marginTop: '1.5rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map((post) => (
              <tr key={post.id}>
                <td><strong>{post.title}</strong></td>
                <td><span className="badge badge-gold">{post.category}</span></td>
                <td>{new Date(post.publishedAt).toLocaleDateString()}</td>
                <td className="action-cell">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openEdit(post)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(post.id, post.title)}
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
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
        .admin-table-wrap { overflow-x: auto; background: var(--white); border: 1px solid var(--ivory-dark); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .admin-table th, .admin-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid var(--ivory-dark); }
        .admin-table th { background: var(--black); color: var(--white); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }
        .action-cell { display: flex; gap: 0.5rem; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
