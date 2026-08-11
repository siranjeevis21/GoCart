import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleMoveToCart = async (item) => {
    try {
      const prod = item.product_detail;
      if (prod.stock_quantity <= 0) {
        showToast(`"${prod.name}" is out of stock.`, 'danger');
        return;
      }
      await addToCart(prod.id, 1);
      await removeFromWishlist(item.id);
      showToast(`Moved "${prod.name}" to cart.`, 'success');
    } catch (err) {
      showToast('Failed to move item to cart.', 'danger');
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeFromWishlist(item.id);
      showToast('Removed item from wishlist.', 'success');
    } catch (err) {
      showToast('Failed to remove item.', 'danger');
    }
  };

  const getPastelColor = (index) => {
    const pastels = ['var(--pastel-purple)', 'var(--pastel-pink)', 'var(--pastel-yellow)', 'var(--pastel-mint)', 'var(--pastel-coral)'];
    return pastels[index % pastels.length];
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

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

      <h1 className="title-page">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="empty-state card-glass" style={{ maxWidth: '600px', margin: '2rem auto', borderStyle: 'solid' }}>
          <span className="empty-state-icon" style={{ color: 'var(--pink)' }}>♥</span>
          <h2 className="empty-state-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Your wishlist is waiting.</h2>
          <p className="empty-state-text">Explore our catalogue and click the heart icon to save products here for later.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ width: 'auto', padding: '0.8rem 2.2rem' }}>
            EXPLORE PRODUCTS
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((item, idx) => {
            const prod = item.product_detail;
            if (!prod) return null;
            return (
              <div className="product-card" key={item.id}>
                {/* Heart wishlist active toggle */}
                <button 
                  className="product-card-wishlist-btn active"
                  onClick={() => handleRemove(item)}
                  aria-label="Remove from wishlist"
                >
                  ♥
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

                  <div className="product-card-price-row">
                    <span className="price-actual" style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹{prod.discount_price || prod.price}</span>
                    {prod.discount_price && <span className="price-original" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹{prod.price}</span>}
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleMoveToCart(item)}
                    disabled={prod.stock_quantity <= 0}
                  >
                    {prod.stock_quantity <= 0 ? 'Out of Stock' : 'MOVE TO CART 🛒'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
