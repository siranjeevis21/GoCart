import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = await login(username, password);
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        await logout();
        setError('Access Denied: Administrator privileges required.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper" style={{ minHeight: '65vh' }}>
      {/* LEFT: E-Commerce Admin Vector Graphic */}
      <div className="auth-illustration-side" style={{ position: 'relative' }}>
        {/* Background shapes */}
        <div style={{ width: '220px', height: '220px', borderRadius: '50%', background: 'var(--pastel-purple)', position: 'absolute', zIndex: 1 }} />
        <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'var(--pastel-coral)', position: 'absolute', bottom: '10%', right: '10%', zIndex: 1 }} />
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--pastel-mint)', position: 'absolute', top: '10%', left: '10%', zIndex: 1 }} />
        
        {/* Vector layered panels */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', width: '280px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚙️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Control Center</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secure Admin Portal</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.2rem', boxShadow: 'var(--shadow-lg)', alignSelf: 'flex-end', width: '240px', borderLeft: '4px solid var(--pink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Management Console</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem' }}>SECURE</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '85%', marginBottom: '0.4rem' }} />
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '60%' }} />
          </div>
        </div>
      </div>

      {/* RIGHT: Admin Login Card */}
      <div className="card-glass">
        <h2 className="title-page" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Admin Console</h2>
        
        {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ADMIN USERNAME OR EMAIL</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter admin credentials"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px', borderRadius: 'var(--radius-full)' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

        <div className="form-footer-text" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Need assistance? Please contact the platform system administrator.
          <div style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
            Are you a customer?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Go to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
