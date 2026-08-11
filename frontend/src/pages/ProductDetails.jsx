import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        showToast('Product not found.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val) => {
    if (!product) return;
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= product.stock_quantity) {
      setQuantity(newQty);
    }
  };

  const handleCartAdd = async () => {
    if (!user) {
      showToast('Please login to add items to cart.', 'danger');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setAdding(false);
      setAdded(true);
      showToast(`Added ${quantity} item(s) to your cart.`, 'success');
      setTimeout(() => setAdded(null), 2000);
    } catch (err) {
      setAdding(false);
      showToast(err.response?.data?.error || 'Failed to add to cart.', 'danger');
    }
  };

  const handleWishlistToggle = async () => {
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

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">⚠️</span>
        <h2 className="empty-state-title">Product not found</h2>
        <p className="empty-state-text">The product you're looking for does not exist or has been removed from our catalog.</p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/products')}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

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

      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 1.2rem' }} onClick={() => navigate(-1)}>
          ← Back to Catalogue
        </button>
      </div>

      <div className="product-details-container card-glass" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '3rem' }}>
        {/* Product Image Column */}
        <div 
          style={{ 
            aspectRatio: 1.1, 
            backgroundColor: 'var(--pastel-purple)', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '7rem' }}>📦</div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="product-details-info" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <span className="product-card-brand" style={{ fontSize: '0.85rem' }}>{product.brand || 'Unbranded'}</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem', letterSpacing: '-1px', lineHeight: 1.2 }}>{product.name}</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className={`status-badge confirmed`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
              Category: {product.category_detail?.name || 'General'}
            </span>
            {isOutOfStock ? (
              <span className={`status-badge cancelled`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                Out of Stock 🚫
              </span>
            ) : (
              <span className={`status-badge delivered`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                In Stock ({product.stock_quantity})
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.7 }}>
            {product.description || 'No detailed description is available for this product. High quality materials, premium craftsmanship, and customer satisfaction guaranteed.'}
          </p>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
            <span className="price-actual" style={{ fontSize: '2rem', fontWeight: 800 }}>₹{product.discount_price || product.price}</span>
            {product.discount_price && (
              <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                ₹{product.price}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <div>
              <span className="form-label" style={{ marginBottom: '0.4rem' }}>Select Quantity</span>
              <div className="quantity-selector" style={{ width: '130px', background: 'var(--bg-soft)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)' }}>
                <button className="quantity-btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                <div className="quantity-input">{quantity}</div>
                <button className="quantity-btn" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock_quantity}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleCartAdd} 
              disabled={isOutOfStock || adding}
              style={{ flexGrow: 2, height: '48px', borderRadius: 'var(--radius-full)' }}
            >
              {isOutOfStock ? 'Out of Stock' : 
               adding ? 'ADDING...' : 
               added ? '✓ ADDED TO CART' : 'ADD TO CART 🛒'}
            </button>
            
            <button 
              className={`btn btn-outline ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              style={{ 
                width: '48px', 
                height: '48px', 
                padding: 0, 
                borderRadius: 'var(--radius-full)',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: isInWishlist(product.id) ? 'var(--pink-bright)' : 'inherit',
                borderColor: isInWishlist(product.id) ? 'var(--pink)' : 'var(--border-color)',
                background: isInWishlist(product.id) ? 'var(--pastel-pink)' : 'none'
              }}
              aria-label="Wishlist"
            >
              ♥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
