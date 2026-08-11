import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await API.get(`orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">⚠️</span>
        <h2 className="empty-state-title">Order not found</h2>
        <p className="empty-state-text">{error || "We couldn't retrieve this order's information."}</p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 1rem' }} onClick={() => navigate(-1)}>
          ← Back to List
        </button>
        
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <span className={`status-badge ${order.status.toLowerCase()}`}>
            Status: {order.status}
          </span>
          <span className={`status-badge ${order.payment_status === 'PAID' ? 'delivered' : 'pending'}`}>
            Payment: {order.payment_status}
          </span>
        </div>
      </div>

      <h1 className="title-page" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Order #{order.id}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Shipping details */}
        <div className="card-glass">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Shipping Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Name:</span>{' '}
              <strong style={{ color: 'var(--text-main)' }}>{order.shipping_name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Phone:</span> {order.shipping_phone}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Address:</span>
              <p style={{ marginTop: '0.2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} - {order.shipping_zip_code}
              </p>
            </div>
          </div>
        </div>

        {/* Order Meta details */}
        <div className="card-glass">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Order Meta</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>{' '}
              {new Date(order.created_at).toLocaleString()}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Last Update:</span>{' '}
              {new Date(order.updated_at).toLocaleString()}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>{' '}
              Cash on Delivery (COD)
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount Placed:</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
                ₹{parseFloat(order.total_amount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized list of products ordered */}
      <div className="card-glass">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Order Items</h2>
        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.product_detail ? (
                      <Link to={`/products/${item.product}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {item.product_detail.name}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Deleted Product</span>
                    )}
                  </td>
                  <td>{item.product_detail?.brand || '–'}</td>
                  <td>₹{parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    ₹{parseFloat(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
