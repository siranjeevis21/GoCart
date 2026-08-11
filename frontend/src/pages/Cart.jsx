import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleQtyAdjust = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemove(item);
      return;
    }
    const maxStock = item.product_detail?.stock_quantity || 10;
    if (newQty > maxStock) {
      showToast(`Only ${maxStock} items left in stock.`, 'danger');
      return;
    }
    try {
      await updateQuantity(item.id, newQty);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update quantity.', 'danger');
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeItem(item.id);
      showToast('Item removed from cart.', 'success');
    } catch (err) {
      showToast('Failed to remove item.', 'danger');
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart();
        showToast('Cart cleared successfully.', 'success');
      } catch (err) {
        showToast('Failed to clear cart.', 'danger');
      }
    }
  };

  if (loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  const items = cart.items || [];

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

      <h1 className="title-page">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="empty-state card-glass" style={{ maxWidth: '600px', margin: '2rem auto', borderStyle: 'solid' }}>
          <span className="empty-state-icon">🛒</span>
          <h2 className="empty-state-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Your cart is empty</h2>
          <p className="empty-state-text">Before you check out, you must add some products to your shopping cart.</p>
          <Link to="/products" className="btn btn-primary" style={{ width: 'auto', padding: '0.8rem 2.2rem' }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart items list */}
          <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {items.map(item => {
              const prod = item.product_detail;
              if (!prod) return null;
              const price = prod.discount_price || prod.price;
              
              return (
                <div className="cart-item card-glass" key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem' }}>
                  {/* Image wrapped in soft pastel container */}
                  <Link 
                    to={`/products/${prod.id}`}
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      backgroundColor: 'var(--pastel-purple)', 
                      borderRadius: 'var(--radius-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    <img src={prod.image || 'https://via.placeholder.com/80'} alt={prod.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                  </Link>

                  {/* Info */}
                  <div style={{ flexGrow: 1 }}>
                    <span className="product-card-brand" style={{ fontSize: '0.7rem' }}>{prod.brand}</span>
                    <Link to={`/products/${prod.id}`}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{prod.name}</h3>
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                      ₹{price} each
                    </span>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="quantity-selector" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', flexShrink: 0 }}>
                    <button className="quantity-btn" onClick={() => handleQtyAdjust(item, -1)}>-</button>
                    <div className="quantity-input">{item.quantity}</div>
                    <button className="quantity-btn" onClick={() => handleQtyAdjust(item, 1)}>+</button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', minWidth: '90px', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SUBTOTAL</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{(price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Action */}
                  <button 
                    onClick={() => handleRemove(item)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: 'var(--radius-full)', 
                      border: '1px solid var(--border-color)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      color: 'var(--coral)',
                      backgroundColor: 'var(--pastel-coral)',
                      flexShrink: 0
                    }}
                    aria-label="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/products" className="btn btn-outline" style={{ width: 'auto', padding: '0.65rem 1.6rem' }}>
                ← Continue Shopping
              </Link>
              <button className="btn btn-danger" style={{ width: 'auto', padding: '0.65rem 1.6rem' }} onClick={handleClear}>
                Clear Cart 🗑️
              </button>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="card-glass" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Order Summary</h2>
            
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{cart.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
              {cart.delivery > 0 ? (
                <span style={{ fontWeight: 700 }}>₹{cart.delivery.toFixed(2)}</span>
              ) : (
                <span style={{ fontWeight: 800, color: 'var(--mint)' }}>FREE</span>
              )}
            </div>

            <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Grand Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{cart.total.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ height: '48px', borderRadius: 'var(--radius-full)' }}
              onClick={() => navigate('/checkout')}
            >
              PROCEED TO CHECKOUT 💳
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
