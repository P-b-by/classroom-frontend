import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import axios from 'axios';
import './Orders.css'; // Make sure this matches your existing CSS filename or create it

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetches your comprehensive order list from our updated MongoDB routing api
    axios.get('/api/orders')
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin metrics:", err);
        setError('Failed to pull structural order data arrays from the database.');
        setLoading(false);
      });
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'badge-success';
      case 'processing': return 'badge-warning';
      default: return 'badge-pending';
    }
  };

  if (loading) return <div style={{ padding: '3rem', color: '#64748b', fontWeight: '500' }}>Accessing data logs...</div>;
  if (error) return <div style={{ padding: '3rem', color: '#ef4444' }}>⚠️ {error}</div>;

  return (
    <div className="admin-orders-container">
      <header className="orders-header">
        <div>
          <h2>System Order Manifest</h2>
          <p className="subtitle-text">Monitor customer demographics and item metrics securely</p>
        </div>
        <span className="order-count">{orders.length} Active Records</span>
      </header>

      {orders.length === 0 ? (
        <div className="empty-state-box">No customer invoices processed inside MongoDB database yet.</div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            // 🔹 SAFE ID GATING: Protects the string slicer if old or malformed IDs exist
            const displayId = order._id 
              ? order._id.slice(-6).toUpperCase() 
              : String(order.id || 'N/A').slice(-6).toUpperCase();

            // 🔹 SAFE TIMESTAMPS: Converts your MongoDB timestamps into readable Kenyan format
            const formattedTime = order.createdAt 
              ? new Date(order.createdAt).toLocaleString('en-KE', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })
              : 'Unknown Time';

            return (
              <div key={order._id || order.id} className="sleek-order-card">
                <div className="card-header-row">
                  <span className="order-id">#{displayId}</span>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>

                <div className="timestamp">Placed: {formattedTime}</div>

                {/* Demographics Area */}
                <div className="card-section">
                  <h4 className="section-title">Client Demographics</h4>
                  <div className="demographics-info">
                    <p className="customer-name">{order.customerName || 'Anonymous Buyer'}</p>
                    <p className="customer-meta">📞 {order.customerPhone || 'No contact numbers'}</p>
                    <p className="customer-meta">✉️ {order.customerEmail || 'No email log'}</p>
                    <p className="customer-address">
                      📍 Destination: {order.shippingAddress?.street || order.address || 'N/A'}, {order.shippingAddress?.city || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Purchased Items Sub-Array Area */}
                <div className="card-section">
                  <h4 className="section-title">Purchased Items Manifest</h4>
                  <ul className="items-list">
                    {/* 🔹 SAFE ARRAY LOOP: Fallback empty array prevents blank screen parsing crashes */}
                    {(order.items || []).map((item, idx) => (
                      <li key={item.productId || idx} className="item-row">
                        <div className="item-main">
                          <span className="item-name">{item.name || item.title || 'Inventory Fit'}</span>
                          <span className="item-size">
                            Size: {item.selectedSize || item.size || 'Standard'}
                          </span>
                        </div>
                        <span className="item-qty">x{item.quantity || 1}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer-row">
                  <span className="total-label">Grand Collection Total</span>
                  <span className="total-price">KES {(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
