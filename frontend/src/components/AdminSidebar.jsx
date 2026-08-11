import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.8rem 1.2rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: isActive ? 'var(--primary-deep)' : '#FFFFFF',
    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
    transition: 'var(--transition-smooth)'
  });

  return (
    <div 
      style={{ 
        width: '250px', 
        backgroundColor: 'var(--primary)', 
        background: 'linear-gradient(185deg, var(--primary) 0%, var(--primary-deep) 100%)',
        borderRadius: 'var(--radius-lg)', 
        padding: '2.5rem 1.2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.6rem', 
        color: '#FFFFFF',
        height: 'fit-content',
        boxShadow: 'var(--shadow-md)',
        flexShrink: 0
      }}
    >
      <div style={{ paddingLeft: '1.2rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.85 }}>Control Center</span>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.5px' }}>GoCart Admin</h3>
      </div>

      <NavLink to="/admin/dashboard" style={linkStyle}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/admin/products" style={linkStyle}>
        📦 Products
      </NavLink>
      <NavLink to="/admin/categories" style={linkStyle}>
        📁 Categories
      </NavLink>
      <NavLink to="/admin/users" style={linkStyle}>
        👥 Customers
      </NavLink>
      <NavLink to="/admin/orders" style={linkStyle}>
        📋 Orders
      </NavLink>
      
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '1.5rem 0' }} />
      
      <button 
        onClick={handleLogout} 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1.2rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: '#FFFFFF',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
