import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    role: 'CUSTOMER',
    adminCode: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, first_name, last_name, role, adminCode } = formData;
    
    if (!username || !email || !password || !first_name || !last_name) {
      setError('Please fill in all required fields (*).');
      return;
    }
    if (role === 'ADMIN') {
      if (!adminCode) {
        setError('Please enter the Admin Secret Code to register as an administrator.');
        return;
      }
      if (adminCode !== '@NEXSTON2026') {
        setError('Invalid Admin Secret Code. You are not authorized to create an administrator account.');
        return;
      }
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('auth/register/', {
        username,
        email,
        password,
        first_name,
        last_name,
        phone: formData.phone,
        address: formData.address,
        role
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const errors = err.response.data;
        const msg = Object.keys(errors)
          .map(key => `${key}: ${errors[key]}`)
          .join(', ');
        setError(msg || 'Registration failed.');
      } else {
        setError('Network error, please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper" style={{ minHeight: '80vh' }}>
      {/* LEFT: E-Commerce Vector Graphic */}
      <div className="auth-illustration-side" style={{ position: 'relative' }}>
        {/* Background shapes */}
        <div style={{ width: '260px', height: '260px', borderRadius: '50%', background: 'var(--pastel-mint)', position: 'absolute', zIndex: 1 }} />
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--pastel-pink)', position: 'absolute', top: '10%', right: '5%', zIndex: 1 }} />
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--pastel-coral)', position: 'absolute', bottom: '15%', left: '5%', zIndex: 1 }} />

        {/* Vector layered panels */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', width: '280px' }}>
          <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📦</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Create Account</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start shopping today</div>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.2rem', boxShadow: 'var(--shadow-lg)', alignSelf: 'flex-end', width: '240px', borderLeft: '4px solid var(--pink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Membership Card</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem' }}>FREE</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '90%', marginBottom: '0.4rem' }} />
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', width: '60%' }} />
          </div>
        </div>
      </div>

      {/* RIGHT: Register Card */}
      <div className="card-glass" style={{ margin: '1rem 0' }}>
        <h2 className="title-page" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Create Your Account</h2>
        
        {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">FIRST NAME *</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">LAST NAME *</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">USERNAME *</label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">PASSWORD *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CONFIRM PASSWORD *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PHONE NUMBER</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SHIPPING ADDRESS</label>
            <textarea
              name="address"
              className="form-control"
              placeholder="Default shipping address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              style={{ minHeight: '70px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">ROLE *</label>
            <div className="sort-select-wrapper">
              <select name="role" value={formData.role} onChange={handleChange} disabled={loading} style={{ width: '100%' }}>
                <option value="CUSTOMER">Customer (Default)</option>
                <option value="ADMIN">Administrator (Admin Dashboard access)</option>
              </select>
            </div>
          </div>

          {formData.role === 'ADMIN' && (
            <div className="form-group" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
              <label className="form-label" style={{ color: 'var(--pink)' }}>ADMIN SECRET CODE *</label>
              <input
                type="password"
                name="adminCode"
                className="form-control"
                placeholder="Enter admin authorization code"
                value={formData.adminCode}
                onChange={handleChange}
                disabled={loading}
                style={{ borderColor: 'var(--pink)' }}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-secondary" style={{ height: '48px', borderRadius: 'var(--radius-full)' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="form-footer-text" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="form-footer-link" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
