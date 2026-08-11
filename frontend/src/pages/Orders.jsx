import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('orders/');
        setOrders(res.data.results || res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="title-page">My Orders</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📦</span>
          <h2 className="empty-state-title">No orders placed yet</h2>
          <p className="empty-state-text">You haven't placed any orders yet. Visit the catalog to make your first purchase.</p>
          <Link to="/products" className="btn btn-primary" style={{ width: 'auto' }}>
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-row-card" key={order.id}>
              <div className="order-header-row">
                <div>
                  <span className="order-id-label">Order #{order.id}</span>
                  <div className="order-meta-info" style={{ marginTop: '0.2rem' }}>
                    <span>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items scroll list previews */}
              <div className="order-items-scroll" style={{ marginBottom: '1.2rem' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.product_detail?.name || 'Item'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL VALUE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </div>
                </div>

                <Link to={`/orders/${order.id}`} className="btn btn-outline" style={{ width: 'auto', padding: '0.5rem 1.2rem' }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
