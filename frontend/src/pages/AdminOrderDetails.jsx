import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dropdown States
  const [statusVal, setStatusVal] = useState('');
  const [paymentStatusVal, setPaymentStatusVal] = useState('');

  const fetchOrderDetail = async () => {
    try {
      const res = await API.get(`admin/orders/${id}/`);
      setOrder(res.data);
      setStatusVal(res.data.status);
      setPaymentStatusVal(res.data.payment_status);
    } catch (err) {
      console.error(err);
      setError('Order not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await API.put(`admin/orders/${id}/status/`, {
        status: statusVal,
        payment_status: paymentStatusVal
      });
      setSuccess('Order status updated successfully!');
      fetchOrderDetail();
    } catch (err) {
      console.error(err);
      setError('Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

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
        <p className="empty-state-text">{error || "We couldn't retrieve this order's details."}</p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '75vh', alignItems: 'flex-start' }}>
      <AdminSidebar />

      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 1.2rem' }} onClick={() => navigate('/admin/orders')}>
            ← Back to Orders
          </button>
          <h1 className="title-page" style={{ margin: 0 }}>Order Details</h1>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Customer & Shipping card */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Customer Identity</h2>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                Username: <strong style={{ color: 'var(--text-main)' }}>{order.user_username}</strong><br />
                Email: {order.user_email}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Shipping Details</h2>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                Recipient: <strong style={{ color: 'var(--text-main)' }}>{order.shipping_name}</strong><br />
                Phone: {order.shipping_phone}<br />
                Address:<br />
                <p style={{ marginTop: '0.2rem', padding: '0.5rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-color)' }}>
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} - {order.shipping_zip_code}
                </p>
              </div>
            </div>
          </div>

          {/* Change Status Admin Box */}
          <div className="card-glass" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem' }}>Update Statuses</h2>
            
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">ORDER DISPATCH STATUS</label>
                <div className="sort-select-wrapper">
                  <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} disabled={updating} style={{ width: '100%' }}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">PAYMENT SETTLEMENT</label>
                <div className="sort-select-wrapper">
                  <select value={paymentStatusVal} onChange={(e) => setPaymentStatusVal(e.target.value)} disabled={updating} style={{ width: '100%' }}>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ padding: '0.7rem 1.5rem' }} disabled={updating}>
                {updating ? 'Saving Statuses...' : 'Save Status Updates'}
              </button>
            </form>
          </div>
        </div>

        {/* Itemized breakdown table */}
        <div className="card-glass">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem' }}>Receipt items</h2>
          
          <div className="table-responsive">
            <table className="styled-table" style={{ fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.product || '–'}</td>
                    <td>
                      {item.product_detail ? (
                        <Link to={`/products/${item.product}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {item.product_detail.name}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Deleted Product</span>
                      )}
                    </td>
                    <td>₹{parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td style={{ fontWeight: 800 }}>₹{parseFloat(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingRight: '1rem', fontSize: '1.1rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>TOTAL CHARGED (INCLUDING DELIVERY)</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', textAlign: 'right' }}>
                ₹{parseFloat(order.total_amount).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
