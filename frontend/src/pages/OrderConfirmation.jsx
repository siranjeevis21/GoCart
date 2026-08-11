import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="empty-state card-glass" style={{ borderStyle: 'solid', maxWidth: '600px', margin: '4rem auto' }}>
      <span className="empty-state-icon" style={{ color: 'var(--secondary)', fontSize: '4rem' }}>✓</span>
      <h1 className="empty-state-title" style={{ fontSize: '2rem' }}>Order Placed Successfully!</h1>
      <p className="empty-state-text" style={{ fontSize: '1.05rem' }}>
        Thank you for your purchase! Your order <strong>#{orderId}</strong> has been received and is currently being processed.
      </p>
      
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', margin: '1rem 0 1.5rem', width: '100%', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
          <span style={{ fontWeight: 600 }}>Cash on Delivery</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
          <span style={{ fontWeight: 600 }}>#{orderId}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
        <Link to={`/orders/${orderId}`} className="btn btn-primary" style={{ flexGrow: 1 }}>
          View Order Details
        </Link>
        <Link to="/products" className="btn btn-outline" style={{ flexGrow: 1 }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
