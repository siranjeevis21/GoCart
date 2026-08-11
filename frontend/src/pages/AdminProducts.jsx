import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await API.get('products/');
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await API.delete(`products/${id}/`);
        setSuccess(`Product "${name}" deleted successfully.`);
        setTimeout(() => setSuccess(''), 3000);
        fetchProducts();
      } catch (err) {
        console.error(err);
        setError('Failed to delete product.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  if (loading && products.length === 0) {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="title-page" style={{ margin: 0 }}>Manage Products</h1>
          <Link to="/admin/products/add" className="btn btn-secondary" style={{ width: 'auto', padding: '0.65rem 1.6rem' }}>
            + Add Product
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card-glass">
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No products found. Click "+ Add Product" to create your first catalog entry.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="styled-table" style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td>{prod.id}</td>
                      <td>
                        {prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-soft)' }} 
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{prod.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {prod.category_detail?.name || 'General'}
                        </div>
                      </td>
                      <td>{prod.brand || '–'}</td>
                      <td>
                        ₹{prod.discount_price || prod.price}
                        {prod.discount_price && (
                          <div style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            ₹{prod.price}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: prod.stock_quantity === 0 ? 'var(--coral)' : 'var(--text-main)' }}>
                          {prod.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${prod.is_available ? 'delivered' : 'cancelled'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          {prod.is_available ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link 
                            to={`/admin/products/edit/${prod.id}`} 
                            className="btn btn-outline" 
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(prod.id, prod.name)} 
                            className="btn btn-danger" 
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
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
      </div>
    </div>
  );
};

export default AdminProducts;
