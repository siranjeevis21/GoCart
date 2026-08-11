import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const ProductAdd = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Image Preview State
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('categories/');
        setCategories(res.data.results || res.data);
        if ((res.data.results || res.data).length > 0) {
          setCategory((res.data.results || res.data)[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load product categories.');
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      setError('Please fill in all required fields (*).');
      return;
    }
    if (parseFloat(price) < 0 || (discountPrice && parseFloat(discountPrice) < 0) || parseInt(stockQuantity) < 0) {
      setError('Values for price and stock cannot be negative.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('name', name);
    data.append('brand', brand);
    data.append('category', category);
    data.append('price', price);
    if (discountPrice) {
      data.append('discount_price', discountPrice);
    }
    data.append('stock_quantity', stockQuantity);
    data.append('is_available', isAvailable);
    data.append('description', description);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await API.post('products/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Product added successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to add product. Check validations.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCats) {
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 1.2rem' }} onClick={() => navigate('/admin/products')}>
            ← Back
          </button>
          <h1 className="title-page" style={{ margin: 0 }}>Add Product</h1>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card-glass">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">PRODUCT NAME *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">BRAND</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brand name"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PRODUCT CATEGORY *</label>
              <div className="sort-select-wrapper">
                <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} style={{ width: '100%' }}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">PRICE (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">DISCOUNT PRICE (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">STOCK QUANTITY *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Image Upload Input and Preview Box */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label className="form-label">PRODUCT IMAGE</label>
              
              {previewUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px solid var(--border-color)', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-soft)', width: 'fit-content' }}>
                  <img 
                    src={previewUrl} 
                    alt="upload preview" 
                    style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF' }} 
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Image Preview Ready</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
                disabled={loading}
                style={{ padding: '0.5rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPTION</label>
              <textarea
                className="form-control"
                placeholder="Product description and features list..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                disabled={loading}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isAvailable" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Publish Product immediately
              </label>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: 'auto', padding: '0.8rem 2rem' }} disabled={loading}>
              {loading ? 'Creating Product...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
