import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = ({ onSearchChange, searchQuery }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (anchorId) => {
    if (location.pathname !== '/') {
      navigate('/' + anchorId);
    } else {
      const element = document.getElementById(anchorId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* LOGO */}
        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="logo-link">
          GoCart<span className="logo-dot"></span>
        </Link>

        {/* CUSTOMER MAIN LINKS */}
        {!isAdmin && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Shop</NavLink>
            <button onClick={() => handleNavClick('#categories-section')} className="nav-link" style={{ cursor: 'pointer' }}>Categories</button>
            <button onClick={() => handleNavClick('#offers-section')} className="nav-link" style={{ cursor: 'pointer' }}>Offers</button>
          </div>
        )}

        {/* Search bar (Customer only) */}
        {!isAdmin && (
          <div className="search-bar-container">
            <input
              type="text"
              className="navbar-search"
              placeholder="Search products..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (location.pathname !== '/products') {
                  navigate('/products');
                }
              }}
            />
            <span className="search-icon-nav">🔍</span>
          </div>
        )}

        {/* Action Links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {user && (
            <span className="welcome-message">
              Welcome, <span className="welcome-name">{user.first_name || user.username}</span>!
            </span>
          )}
          {isAdmin ? (
            /* Admin view links */
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Products</NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Categories</NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Customers</NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Orders</NavLink>
              <button onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            /* Customer View links */
            <>
              {user ? (
                <>
                  <NavLink to="/wishlist" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Wishlist</NavLink>
                  <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link nav-badge-container active" : "nav-link nav-badge-container"}>
                    <span>Cart</span>
                    {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                  </NavLink>
                  <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Profile</NavLink>
                  <button onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer' }}>Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn-nav-login">Login</NavLink>
                  <NavLink to="/register" className="nav-link">Register</NavLink>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
