import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import BrandLogo from './BrandLogo.jsx';
import './AdminLayout.css';
import './BrandLogo.css';

export default function AdminLayout() {
  const { isAdmin, logoutAdmin } = useStore();
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';

  // while admin status is unknown, don't render admin UI or redirect
  if (isAdmin === null) return null;

  if (isLoginPage) {
    return <Outlet />;
  }

  if (isAdmin !== true && !isLoginPage) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <BrandLogo theme="onDark" size="admin" />
          <div>
            <strong>Admin Panel</strong>
            <small>Domas Ventures</small>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/blog">Blog</NavLink>
          <a href="/">← View Storefront</a>
        </nav>
        <button className="btn btn-outline btn-sm logout-btn" onClick={logoutAdmin}>
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
