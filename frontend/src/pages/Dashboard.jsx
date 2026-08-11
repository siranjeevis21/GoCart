import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('admin/stats/');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
        {error || 'Could not fetch admin statistics.'}
      </div>
    );
  }

  const counts = stats.status_counts || {};
  const maxCount = Math.max(...Object.values(counts), 1);

  const chartBars = [
    { label: 'Pending', count: counts.PENDING || 0 },
    { label: 'Confirmed', count: counts.CONFIRMED || 0 },
    { label: 'Processing', count: counts.PROCESSING || 0 },
    { label: 'Shipped', count: counts.SHIPPED || 0 },
    { label: 'Delivered', count: counts.DELIVERED || 0 },
    { label: 'Cancelled', count: counts.CANCELLED || 0 },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', minHeight: '75vh', alignItems: 'flex-start' }}>
      {/* Sleek Sidebar Left */}
      <AdminSidebar />

      {/* Main Stats Right Content */}
      <div style={{ flexGrow: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="title-page" style={{ marginBottom: '0.2rem' }}>Dashboard Overview</h1>
          {user && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>
              Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{user.first_name || user.username}</span>!
            </p>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Soft Pastel Statistics Cards */}
        <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
          <div className="stat-card card-glass" style={{ backgroundColor: 'var(--pastel-purple)', borderColor: 'rgba(116,100,232,0.1)' }}>
            <span className="stat-card-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL SALES</span>
            <span className="stat-card-value highlight" style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', marginTop: '0.3rem', color: 'var(--primary-deep)' }}>
              ₹{stats.total_sales.toFixed(2)}
            </span>
          </div>
          <div className="stat-card card-glass" style={{ backgroundColor: 'var(--pastel-pink)', borderColor: 'rgba(238,103,174,0.1)' }}>
            <span className="stat-card-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL PRODUCTS</span>
            <span className="stat-card-value" style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', marginTop: '0.3rem' }}>{stats.total_products}</span>
          </div>
          <div className="stat-card card-glass" style={{ backgroundColor: 'var(--pastel-mint)', borderColor: 'rgba(103,212,197,0.1)' }}>
            <span className="stat-card-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIVE CUSTOMERS</span>
            <span className="stat-card-value" style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', marginTop: '0.3rem' }}>{stats.total_customers}</span>
          </div>
          <div className="stat-card card-glass" style={{ backgroundColor: 'var(--pastel-yellow)', borderColor: 'rgba(255,215,106,0.1)' }}>
            <span className="stat-card-title" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL ORDERS</span>
            <span className="stat-card-value" style={{ fontSize: '1.6rem', fontWeight: 800, display: 'block', marginTop: '0.3rem' }}>{stats.total_orders}</span>
          </div>
        </div>

        <div className="dashboard-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Visual Chart Panel */}
          <div className="card-glass" style={{ minHeight: '320px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Order Distribution</h2>
            <div className="stats-chart-visualizer" style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem' }}>
              {chartBars.map(bar => {
                const pct = (bar.count / maxCount) * 160;
                return (
                  <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flexGrow: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{bar.count}</span>
                    <div 
                      style={{ 
                        width: '28px',
                        height: `${Math.max(pct, 10)}px`,
                        borderRadius: '6px 6px 0 0',
                        background: bar.label === 'Delivered' ? 'var(--mint)' : 
                                    bar.label === 'Cancelled' ? 'var(--coral)' : 
                                    bar.label === 'Pending' ? 'var(--yellow)' : 'var(--primary)'
                      }} 
                    />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{bar.label.substring(0, 4)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders log panel */}
          <div className="card-glass">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem' }}>Recent Orders</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {stats.recent_orders?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                  No recent orders.
                </div>
              ) : (
                stats.recent_orders?.map(order => (
                  <div 
                    key={order.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.8rem 1rem', 
                      background: 'var(--bg-soft)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <div>
                      <Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        Order #{order.id}
                      </Link>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                        By {order.user_username}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800 }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      <div style={{ marginTop: '0.15rem' }}>
                        <span className={`status-badge ${order.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
