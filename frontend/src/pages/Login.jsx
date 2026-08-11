import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
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
      if (userData.role === 'CUSTOMER') {
        navigate('/');
      } else {
        await logout();
        setError('Access Denied: Please use the Admin login portal.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper" style={{ minHeight: '65vh' }}>
      {/* LEFT: E-Commerce Vector Graphic */}
      <div className="auth-illustration-side" style={{ position: 'relative' }}>
        {/* Background shapes */}
        <div style={{ width: '220px', height: '220px', borderRadius: '50%', background: 'var(--pastel-purple)', position: 'absolute', zIndex: 1 }} />
        <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'var(--pastel-pink)', position: 'absolute', bottom: '10%', right: '10%', zIndex: 1 }} />
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--pastel-yellow)', position: 'absolute', top: '10%', left: '10%', zIndex: 1 }} />
        
        {/* Vector layered panels */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', width: '280px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🛍️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>E-Commerce Store</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Premium Marketplace</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.2rem', boxShadow: 'var(--shadow-lg)', alignSelf: 'flex-end', width: '240px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Secure Login</span>
              <span style={{ color: 'var(--mint)', fontWeight: 800, fontSize: '0.7rem' }}>ACTIVE</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '80%', marginBottom: '0.4rem' }} />
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '50%' }} />
          </div>
        </div>
      </div>

      {/* RIGHT: Login Card */}
      <div className="card-glass">
        <h2 className="title-page" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Welcome Back</h2>
        
        {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">USERNAME OR EMAIL</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
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
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer-text" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="form-footer-link" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create Account
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
            Are you an administrator?{' '}
            <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
