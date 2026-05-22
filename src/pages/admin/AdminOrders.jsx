import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

export default function AdminOrders() {
  const { orders, deleteOrder, updateOrderStatus } = useStore();
  const [expanded, setExpanded] = useState(null);

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">Customer orders will appear here</p>
        <div className="empty-state" style={{ background: 'var(--white)', borderRadius: 'var(--radius)', marginTop: '2rem' }}>
          <p>No orders yet. Orders placed by customers will show up here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Customer Orders</h1>
      <p className="page-subtitle">{orders.length} order(s) received</p>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div
              className="order-header"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div>
                <strong>{order.id}</strong>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="order-header-right">
                <span className={`badge badge-${order.status}`}>{order.status}</span>
                <span className="order-total">KES {order.total.toLocaleString()}</span>
                <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-details">
                <div className="detail-grid">
                  <div>
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.customer.name}</p>
                    <p><strong>Gender:</strong> {order.customer.gender}</p>
                    <p><strong>Phone:</strong> {order.customer.phone}</p>
                    {order.customer.email && (
                      <p><strong>Email:</strong> {order.customer.email}</p>
                    )}
                    <p><strong>County:</strong> {order.customer.county}</p>
                    <p><strong>Address:</strong> {order.customer.address}</p>
                  </div>
                  <div>
                    <h4>Order Items</h4>
                    <ul className="order-items-list">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          {item.name} — Size {item.size} × {item.quantity} = KES{' '}
                          {(item.price * item.quantity).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      Mark Confirmed
                    </button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (window.confirm('Delete this order?')) deleteOrder(order.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .order-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .order-header:hover {
          background: var(--gray-100);
        }
        .order-date {
          display: block;
          font-size: 0.8rem;
          color: var(--gray-600);
          font-weight: 400;
        }
        .order-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .order-total {
          font-weight: 700;
          color: var(--green);
        }
        .expand-icon {
          color: var(--navy);
          font-size: 0.75rem;
        }
        .order-details {
          padding: 0 1.25rem 1.25rem;
          border-top: 2px solid var(--gray-200);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          padding-top: 1.25rem;
        }
        .detail-grid h4 {
          color: var(--navy);
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }
        .detail-grid p {
          font-size: 0.875rem;
          margin-bottom: 0.35rem;
          color: var(--gray-600);
        }
        .order-items-list {
          list-style: none;
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        .order-items-list li {
          padding: 0.3rem 0;
          border-bottom: 1px solid var(--gray-200);
        }
        .order-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
