import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { fetchProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    role: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('auth/profile/');
        setFormData({
          username: res.data.username,
          email: res.data.email,
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          role: res.data.role
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile details.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await API.put('auth/profile/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address
      });
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({
        ...prev,
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      }));
      // Sync in context
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="title-page">Manage Profile</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card-glass">
        <form onSubmit={handleSubmit}>
          {/* Read-Only Identity Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">ACCOUNT ROLE</label>
              <input
                type="text"
                className="form-control"
                value={formData.role}
                disabled
                style={{ opacity: 0.6, textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="text"
              className="form-control"
              value={formData.email}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          {/* Editable Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">FIRST NAME</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
                disabled={updating}
              />
            </div>
            <div className="form-group">
              <label className="form-label">LAST NAME</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
                disabled={updating}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PHONE NUMBER</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              disabled={updating}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">DEFAULT SHIPPING ADDRESS</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              disabled={updating}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={updating}>
            {updating ? 'Saving changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
