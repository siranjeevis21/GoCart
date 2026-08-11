import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await API.get('categories/');
      setCategories(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageFile(null);
    setError('');
    setSuccess('');
  };

  const handleResetForm = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('name', name);
    data.append('description', description);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editId) {
        await API.patch(`categories/${editId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(`Category updated successfully!`);
      } else {
        await API.post('categories/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(`Category "${name}" created successfully!`);
      }
      handleResetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.name?.[0] || 'Operation failed. Check name duplicates.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"? This will delete all products under this category.`)) {
      setLoading(true);
      try {
        await API.delete(`categories/${id}/`);
        setSuccess(`Category "${catName}" deleted successfully.`);
        setTimeout(() => setSuccess(''), 3000);
        fetchCategories();
      } catch (err) {
        console.error(err);
        setError('Failed to delete category.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && categories.length === 0) {
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
        <h1 className="title-page">Manage Categories</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="dashboard-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Category List Column */}
          <div className="card-glass">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem' }}>Category Directory</h2>
            {categories.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
                No categories registered.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="styled-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>
                          {cat.image ? (
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                          ) : (
                            <span style={{ fontSize: '1.2rem' }}>📦</span>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{cat.name}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button 
                              onClick={() => handleEditClick(cat)} 
                              className="btn btn-outline" 
                              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(cat.id, cat.name)} 
                              className="btn btn-danger" 
                              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add/Edit Form Column */}
          <div className="card-glass" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem' }}>
              {editId ? `Edit Category` : `Add Category`}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">CATEGORY NAME *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  className="form-control"
                  placeholder="Short description of category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">CATEGORY IMAGE</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                  disabled={saving}
                  style={{ padding: '0.4rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editId && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flexGrow: 1, padding: '0.65rem 1rem' }} 
                    onClick={handleResetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ flexGrow: 2, padding: '0.65rem 1rem' }} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
