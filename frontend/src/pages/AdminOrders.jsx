import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await API.get('admin/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, field, value) => {
    try {
      setError('');
      setSuccess('');
      const data = { [field]: value };
      await API.put(`admin/orders/${orderId}/status/`, data);
      setSuccess(`Order #${orderId} updated successfully.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError(`Failed to update Order #${orderId}.`);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '75vh', alignItems: 'flex-start' }}>
      <AdminSidebar />

      <div style={{ flexGrow: 1 }}>
        <h1 className="title-page">Manage Orders</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card-glass">
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No orders placed yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="styled-table" style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Amount</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>Placed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>#{order.id}</strong>
                      </td>
                      <td>
                        <div>{order.shipping_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{order.user_username}</div>
                      </td>
                      <td style={{ fontWeight: 800 }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>
                        <div className="sort-select-wrapper" style={{ display: 'inline-block' }}>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, 'status', e.target.value)}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="sort-select-wrapper" style={{ display: 'inline-block' }}>
                          <select 
                            value={order.payment_status} 
                            onChange={(e) => handleStatusChange(order.id, 'payment_status', e.target.value)}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        </div>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link 
                          to={`/admin/orders/${order.id}`} 
                          className="btn btn-outline" 
                          style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
