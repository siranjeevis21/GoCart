import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

const Products = ({ searchQuery }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useContext(WishlistContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ordering, setOrdering] = useState('newest');

  // Interaction Toast & Button States
  const [toasts, setToasts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const categoryParam = searchParams.get('category') || '';

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryParam, searchQuery, minPrice, maxPrice, ordering]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('categories/');
        setCategories(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `products/?page=${page}&ordering=${ordering}`;
        if (categoryParam) {
          url += `&category=${categoryParam}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (minPrice) {
          url += `&min_price=${minPrice}`;
        }
        if (maxPrice) {
          url += `&max_price=${maxPrice}`;
        }
        const res = await API.get(url);
        const results = res.data.results !== undefined ? res.data.results : res.data;
        setProducts(results);
        
        const count = res.data.count !== undefined ? res.data.count : results.length;
        setTotalPages(Math.ceil(count / 12) || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchQuery, page, minPrice, maxPrice, ordering]);

  const handleCategorySelect = (id) => {
    if (id === '') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', id);
    }
    setSearchParams(searchParams);
  };

  const handleCartAdd = async (product) => {
    if (!user) {
      showToast('Please login to add items to cart.', 'danger');
      return;
    }
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setAddingId(null);
      setAddedId(product.id);
      showToast('Added to cart!', 'success');
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      setAddingId(null);
      showToast(err.response?.data?.error || 'Failed to add to cart.', 'danger');
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!user) {
      showToast('Please login to manage wishlist.', 'danger');
      return;
    }
    try {
      if (isInWishlist(product.id)) {
        const wishId = getWishlistItemId(product.id);
        await removeFromWishlist(wishId);
        showToast('Removed from wishlist', 'success');
      } else {
        await addToWishlist(product.id);
        showToast('Added to wishlist', 'success');
      }
    } catch (err) {
      showToast('Failed to update wishlist.', 'danger');
    }
  };

  const getPastelColor = (index) => {
    const pastels = ['var(--pastel-purple)', 'var(--pastel-pink)', 'var(--pastel-yellow)', 'var(--pastel-mint)', 'var(--pastel-coral)'];
    return pastels[index % pastels.length];
  };

  return (
    <div>
      {/* Toast Overlay */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`custom-toast ${t.type}`}>
            {t.type === 'success' ? '✓' : '⚠️'} {t.message}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title-page" style={{ margin: 0 }}>Shop Catalogue</h1>
        
        <div className="sort-select-wrapper">
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
        {/* Rounded Pill Tabs */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            className={`btn btn-outline ${categoryParam === '' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('')}
            style={{ width: 'auto', padding: '0.45rem 1.2rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', borderColor: categoryParam === '' ? 'var(--primary)' : 'var(--border-color)', color: categoryParam === '' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-outline ${categoryParam === String(cat.id) ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
              style={{ width: 'auto', padding: '0.45rem 1.2rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', borderColor: categoryParam === String(cat.id) ? 'var(--primary)' : 'var(--border-color)', color: categoryParam === String(cat.id) ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>PRICE BOUNDARIES (₹)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              className="form-control"
              style={{ width: '120px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="number"
              className="form-control"
              style={{ width: '120px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <h2 className="empty-state-title">No products found</h2>
          <p className="empty-state-text">We couldn't find any products matching your filters. Try resetting limits.</p>
          <button className="btn btn-outline" style={{ width: 'auto' }} onClick={() => { setMinPrice(''); setMaxPrice(''); handleCategorySelect(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((prod, idx) => (
              <div className="product-card" key={prod.id}>
                <button 
                  className={`product-card-wishlist-btn ${isInWishlist(prod.id) ? 'active' : ''}`}
                  onClick={() => handleWishlistToggle(prod)}
                  aria-label="Wishlist"
                >
                  {isInWishlist(prod.id) ? '♥' : '♡'}
                </button>

                <Link to={`/products/${prod.id}`} className="product-card-image-wrapper" style={{ backgroundColor: getPastelColor(idx) }}>
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="product-card-image" />
                  ) : (
                    <div style={{ fontSize: '3rem' }}>📦</div>
                  )}
                </Link>
                
                <div className="product-card-content">
                  <span className="product-card-brand">{prod.brand}</span>
                  <Link to={`/products/${prod.id}`} className="product-card-title">{prod.name}</Link>
                  
                  <div className="product-rating-row">
                    ★★★★☆ <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>(4.7)</span>
                  </div>

                  <div className="product-card-price-row">
                    <span className="price-actual" style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹{prod.discount_price || prod.price}</span>
                    {prod.discount_price && <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹{prod.price}</span>}
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleCartAdd(prod)}
                    disabled={addingId === prod.id || prod.stock_quantity <= 0}
                  >
                    {prod.stock_quantity <= 0 ? 'Out of Stock' : 
                     addingId === prod.id ? 'ADDING...' : 
                     addedId === prod.id ? '✓ ADDED' : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '3rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ width: 'auto', padding: '0.5rem 1rem' }} 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="btn btn-outline" 
                style={{ width: 'auto', padding: '0.5rem 1rem' }} 
                disabled={page === totalPages}
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
