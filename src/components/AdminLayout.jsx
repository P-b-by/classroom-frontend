import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import './AdminLayout.css';

export default function AdminLayout() {
  const { isAdmin, logoutAdmin } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <small>Admin Console</small>
          <strong>Domas Ventures</strong>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="nav-link">Dashboard</Link>
          <Link to="/admin/products" className="nav-link">Products</Link>
          <Link to="/admin/orders" className="nav-link">Orders</Link>
          <Link to="/admin/blog" className="nav-link">Blog</Link>
          <Link to="/" className="nav-link">View Storefront →</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
