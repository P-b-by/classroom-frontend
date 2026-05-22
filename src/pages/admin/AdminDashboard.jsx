import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';

export default function AdminDashboard() {
  const { products, orders, blogPosts } = useStore();
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your Domas Ventures store</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">Products Listed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-card stat-warning">
          <span className="stat-value">{pendingOrders}</span>
          <span className="stat-label">Pending Orders</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-value">KES {totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{blogPosts.length}</span>
          <span className="stat-label">Blog Articles</span>
        </div>
      </div>

      <div className="admin-actions">
        <Link to="/admin/products" className="btn btn-primary">
          Manage Products
        </Link>
        <Link to="/admin/orders" className="btn btn-green">
          View Orders
        </Link>
        <Link to="/admin/blog" className="btn btn-outline">
          Manage Blog
        </Link>
      </div>

      {orders.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Recent Orders
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>County</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer.name}</td>
                    <td>{order.customer.county}</td>
                    <td>KES {order.total.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--white);
          padding: 1.5rem;
          border-radius: var(--radius);
          border-left: 4px solid var(--navy);
          box-shadow: var(--shadow);
        }
        .stat-card.stat-warning { border-color: #f39c12; }
        .stat-card.stat-green { border-color: var(--green); }
        .stat-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--navy);
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        .admin-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .admin-table-wrap {
          overflow-x: auto;
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
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
          border-bottom: 1px solid var(--gray-200);
        }
        .admin-table th {
          background: var(--navy);
          color: var(--white);
          font-weight: 600;
        }
        .admin-table tr:hover td {
          background: var(--gray-100);
        }
      `}</style>
    </div>
  );
}
