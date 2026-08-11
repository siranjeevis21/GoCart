import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useContext(WishlistContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction & Toast States
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await API.get('categories/');
        setCategories(catRes.data.results || catRes.data);
        
        const prodRes = await API.get('products/?ordering=-created_at');
        const prodData = prodRes.data.results || prodRes.data;
        setFeaturedProducts(prodData.slice(0, 4));
        setTrendingProducts(prodData);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      showToast('Product added to cart!', 'success');
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

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`custom-toast ${t.type}`}>
            {t.type === 'success' ? '✓' : '⚠️'} {t.message}
          </div>
        ))}
      </div>

      {/* 1. HERO SECTION */}
      <div className="hero-wrapper">
        {/* Background circular floating decorations */}
        <div className="circle-decoration d1"></div>
        <div className="circle-decoration d2"></div>
        <div className="circle-decoration d3"></div>

        <div className="hero-left-content">
          {user && (
            <div className="home-welcome-badge">
              👋 Welcome back, {user.first_name || user.username}!
            </div>
          )}
          <h1 className="hero-headline">
            Everything You Need,<br />
            <span style={{ color: 'var(--primary)' }}>All in One Place.</span>
          </h1>
          <p className="hero-description">
            Discover products you love, save your favorites, and shop effortlessly from one beautiful marketplace.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary" style={{ width: 'auto', padding: '0.85rem 2.2rem' }}>
              SHOP NOW
            </Link>
            <button onClick={() => navigate('/products')} className="btn btn-outline" style={{ width: 'auto', padding: '0.85rem 2.2rem' }}>
              EXPLORE PRODUCTS
            </button>
          </div>
        </div>

        {/* Vector E-commerce illustration */}
        <div className="hero-illustration-container">
          <div className="vector-phone-frame">
            <div className="vector-phone-notch"></div>
            <div className="vector-phone-screen">
              <div className="vector-phone-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="vector-phone-circle" style={{ backgroundColor: 'var(--pastel-purple)' }} />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="vector-phone-line" style={{ width: '60%' }} />
                  <div className="vector-phone-line" style={{ width: '40%' }} />
                </div>
              </div>
              <div className="vector-phone-card" style={{ borderLeft: '4px solid var(--pink)' }}>
                <div className="vector-phone-circle" style={{ backgroundColor: 'var(--pastel-pink)' }} />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="vector-phone-line" style={{ width: '80%' }} />
                  <div className="vector-phone-line" style={{ width: '30%' }} />
                </div>
              </div>
              <div className="vector-phone-card" style={{ borderLeft: '4px solid var(--mint)' }}>
                <div className="vector-phone-circle" style={{ backgroundColor: 'var(--pastel-mint)' }} />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="vector-phone-line" style={{ width: '50%' }} />
                  <div className="vector-phone-line" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>
          {/* Floating cards */}
          <div className="vector-floating-card c1">
            <span style={{ fontSize: '1.5rem' }}>🛍️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Active Orders</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delivering Today</div>
            </div>
          </div>
          <div className="vector-floating-card c2">
            <span style={{ fontSize: '1.5rem' }}>💳</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Safe Payment</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>COD / Cards</div>
            </div>
          </div>
          <div className="vector-floating-card c3">
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Top Rating</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4.9/5 Average</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY SECTION */}
      <div id="categories-section" style={{ padding: '4rem 0' }}>
        <h2 className="title-page" style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem' }}>Shop by Category</h2>
        <div className="category-cards-container">
          {categories.map((cat, idx) => (
            <Link to={`/products?category=${cat.id}`} className="category-card" key={cat.id}>
              <div className="category-card-icon">
                {cat.name.includes("Electronics") && "💻"}
                {cat.name.includes("Clothing") && "👕"}
                {cat.name.includes("Home") && "🏠"}
                {cat.name.includes("Stationery") && "📚"}
                {cat.name.includes("Beauty") && "💄"}
                {cat.name.includes("Sports") && "⚽"}
                {cat.name.includes("Accessories") && "🎒"}
                {!["Electronics", "Clothing", "Home", "Stationery", "Beauty", "Sports", "Accessories"].some(x => cat.name.includes(x)) && "📦"}
              </div>
              <h3 className="category-card-name">
                {cat.name} <span className="category-card-arrow">→</span>
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. FEATURED PRODUCTS */}
      <div style={{ padding: '4rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
          <h2 className="title-page" style={{ fontSize: '1.8rem', margin: 0 }}>Featured Products</h2>
          <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>View All →</Link>
        </div>

        <div className="products-grid">
          {featuredProducts.map((prod, idx) => (
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
                  ★★★★☆ <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>(4.8)</span>
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
      </div>

      {/* 4. PROMOTIONAL SECTION */}
      <div id="offers-section" className="promo-banner">
        <div>
          <h2 className="promo-title">Fresh Finds.<br />Better Prices.</h2>
          <p className="promo-text">Discover our latest collection of premium, highly curated products with safe checkout and fast shipping.</p>
          <button onClick={() => navigate('/products')} className="btn btn-secondary" style={{ width: 'auto', padding: '0.8rem 2rem' }}>
            EXPLORE OFFERS
          </button>
        </div>
        {/* Floating circles on right side */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '200px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--yellow)', position: 'absolute', top: '10%', left: '20%', opacity: 0.8 }} />
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--pink)', position: 'absolute', bottom: '10%', right: '20%', opacity: 0.8 }} />
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--mint)', position: 'absolute', top: '40%', right: '10%', opacity: 0.8 }} />
        </div>
      </div>

      {/* 5. TRENDING PRODUCTS */}
      <div style={{ padding: '2rem 0 4rem' }}>
        <h2 className="title-page" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Trending Now</h2>
        <div className="carousel-horizontal">
          {trendingProducts.map((prod, idx) => (
            <div className="carousel-product-wrapper" key={prod.id}>
              <div className="product-card" style={{ height: '100%' }}>
                <button 
                  className={`product-card-wishlist-btn ${isInWishlist(prod.id) ? 'active' : ''}`}
                  onClick={() => handleWishlistToggle(prod)}
                  aria-label="Wishlist"
                >
                  {isInWishlist(prod.id) ? '♥' : '♡'}
                </button>

                <Link to={`/products/${prod.id}`} className="product-card-image-wrapper" style={{ backgroundColor: getPastelColor(idx + 1) }}>
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
                    ★★★★★ <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>(5.0)</span>
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
            </div>
          ))}
        </div>
      </div>

      {/* 6. WHY SHOP WITH US */}
      <div className="features-grid">
        <div className="feature-card" style={{ backgroundColor: 'var(--pastel-purple)' }}>
          <div className="feature-icon">🚚</div>
          <h3 className="feature-title">Fast Delivery</h3>
          <p className="feature-description">Express home delivery with real-time tracking.</p>
        </div>
        <div className="feature-card" style={{ backgroundColor: 'var(--pastel-pink)' }}>
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Secure Shopping</h3>
          <p className="feature-description">Encrypted transactions and secure backend verification.</p>
        </div>
        <div className="feature-card" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
          <div className="feature-icon">↩</div>
          <h3 className="feature-title">Easy Returns</h3>
          <p className="feature-description">No questions asked 30-day return policy.</p>
        </div>
        <div className="feature-card" style={{ backgroundColor: 'var(--pastel-mint)' }}>
          <div className="feature-icon">💳</div>
          <h3 className="feature-title">Safe Payments</h3>
          <p className="feature-description">Pay securely with Cash on Delivery or credit card.</p>
        </div>
      </div>

      {/* 7. NEWSLETTER */}
      <div className="newsletter-container">
        {/* Floating background shape */}
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', position: 'absolute', top: '-60px', left: '-50px' }} />
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', position: 'absolute', bottom: '-40px', right: '-30px' }} />

        <h2 className="newsletter-title">Stay in the Loop</h2>
        <p className="newsletter-description">Get updates about new arrivals, exclusive offers, and products you'll love.</p>
        
        <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); showToast('Subscribed to newsletter!', 'success'); }}>
          <input type="email" placeholder="Enter your email" className="newsletter-input" required />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.6rem' }}>
            SUBSCRIBE
          </button>
        </form>
      </div>

      {/* 8. FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo-col">
            <Link to="/" className="logo-link">
              GoCart<span className="logo-dot"></span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              Experience the future of digital shopping with GoCart. Designed for seamless performance and friendly service.
            </p>
          </div>

          <div>
            <h3 className="footer-col-title">SHOP</h3>
            <ul className="footer-links-list">
              <li><Link to="/products" className="footer-link">Products</Link></li>
              <li><button onClick={() => handleNavClick('#categories-section')} className="footer-link">Categories</button></li>
              <li><button onClick={() => handleNavClick('#offers-section')} className="footer-link">Offers</button></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-col-title">SUPPORT</h3>
            <ul className="footer-links-list">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Contact</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">FAQ</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Returns</a></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-col-title">COMPANY</h3>
            <ul className="footer-links-list">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">About Us</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} GoCart Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
