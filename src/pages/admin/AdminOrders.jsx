import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

export default function AdminOrders() {
  const { orders, deleteOrder, updateOrderStatus } = useStore();
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

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

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'Confirmed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'Cancelled');
  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'Delivered');

  const tabs = [
    { id: 'pending', label: 'Pending Orders', count: pendingOrders.length, color: '#f39c12' },
    { id: 'confirmed', label: 'For Delivery', count: confirmedOrders.length, color: '#10b981' },
    { id: 'delivered', label: 'Delivered', count: deliveredOrders.length, color: '#3b82f6' },
    { id: 'cancelled', label: 'Cancelled', count: cancelledOrders.length, color: '#ef4444' },
  ];

  const getOrdersToShow = () => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'confirmed': return confirmedOrders;
      case 'delivered': return deliveredOrders;
      case 'cancelled': return cancelledOrders;
      default: return orders;
    }
  };

  const ordersToShow = getOrdersToShow();

  return (
    <div>
      <h1 className="page-title">Order Management</h1>
      <p className="page-subtitle">Manage and track all customer orders</p>

      {/* Status Tabs */}
      <div className="order-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`order-tab ${activeTab === tab.id ? 'order-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            {tab.label}
            <span className="order-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {ordersToShow.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--white)', borderRadius: 'var(--radius)', marginTop: '2rem', padding: '3rem' }}>
          <p>No {activeTab} orders found.</p>
        </div>
      ) : (
        <div className="orders-list">
          {ordersToShow.map((order) => {
            const orderId = order._id || order.id;
            return (
              <div key={orderId} className="order-card">
                <div
                  className="order-header"
                  onClick={() => setExpanded(expanded === orderId ? null : orderId)}
                >
                  <div>
                    <strong>{orderId?.slice(-6).toUpperCase() || orderId}</strong>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="order-header-right">
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <span className="order-total">KES {(order.total || 0).toLocaleString()}</span>
                    <span className="expand-icon">{expanded === orderId ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === orderId && (
                  <div className="order-details">
                    <div className="detail-grid">
                      <div>
                        <h4>Customer Details</h4>
                        <p><strong>Name:</strong> {order.customerName || order.customer?.name || 'N/A'}</p>
                        {order.customer?.gender && (
                          <p><strong>Gender:</strong> {order.customer.gender}</p>
                        )}
                        <p><strong>Phone:</strong> {order.customerPhone || order.customer?.phone || 'N/A'}</p>
                        {(order.customerEmail || order.customer?.email) && (
                          <p><strong>Email:</strong> {order.customerEmail || order.customer?.email}</p>
                        )}
                        {order.shippingAddress ? (
                          <>
                            <p><strong>City:</strong> {order.shippingAddress.city || order.customer?.county || 'N/A'}</p>
                            <p><strong>Address:</strong> {order.shippingAddress.street || order.customer?.address || 'N/A'}</p>
                            {order.shippingAddress.country && (
                              <p><strong>Country:</strong> {order.shippingAddress.country}</p>
                            )}
                            {order.shippingAddress.postalCode && (
                              <p><strong>Postal Code:</strong> {order.shippingAddress.postalCode}</p>
                            )}
                          </>
                        ) : (
                          <>
                            {order.customer?.county && (
                              <p><strong>County:</strong> {order.customer.county}</p>
                            )}
                            {order.customer?.address && (
                              <p><strong>Address:</strong> {order.customer.address}</p>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <h4>Order Items</h4>
                        <ul className="order-items-list">
                          {(order.items || []).map((item, i) => (
                            <li key={i}>
                              {item.name || 'Unknown Product'} — Size {item.selectedSize || item.size || 'N/A'} × {item.quantity || 1} = KES{' '}
                              {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="order-actions">
                      {/* Always show confirm button for pending orders */}
                      {order.status === 'pending' && (
                        <button
                          className="btn btn-green btn-sm"
                          onClick={() => updateOrderStatus(orderId, 'confirmed')}
                        >
                          ✓ Confirm Order
                        </button>
                      )}
                      {/* For confirmed orders, add mark as delivered */}
                      {(order.status === 'confirmed' || order.status === 'Confirmed') && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateOrderStatus(orderId, 'delivered')}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {/* Show cancel for non-cancelled orders */}
                      {order.status !== 'cancelled' && order.status !== 'Cancelled' && order.status !== 'delivered' && order.status !== 'Delivered' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => updateOrderStatus(orderId, 'cancelled')}
                        >
                          ✕ Cancel
                        </button>
                      )}
                      {/* Delete button */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Delete this order permanently?')) deleteOrder(orderId);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .order-tabs {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--ivory-dark);
        }
        .order-tab {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 2px solid var(--ivory-dark);
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--motion-fast);
        }
        .order-tab:hover {
          border-color: var(--tab-color);
          color: var(--tab-color);
        }
        .order-tab--active {
          background: var(--tab-color);
          border-color: var(--tab-color);
          color: var(--white);
        }
        .order-tab-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .order-tab--active .order-tab-count {
          background: rgba(255, 255, 255, 0.3);
          color: var(--white);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        .order-card {
          background: var(--white);
          border-radius: 12px;
          box-shadow: var(--shadow);
          overflow: hidden;
          border-left: 4px solid var(--tab-color);
          transition: all var(--motion-medium);
        }
        .order-card:hover {
          box-shadow: var(--shadow-deep);
          transform: translateY(-2px);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.02);
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
          font-size: 1rem;
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
          font-weight: 600;
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
          padding-top: 1.25rem;
          border-top: 1px solid var(--gray-200);
        }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr; }
          .order-tabs { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
