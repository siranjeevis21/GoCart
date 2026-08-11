import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="empty-state" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <span className="empty-state-icon" style={{ fontSize: '4.5rem' }}>🔍</span>
      <h1 className="empty-state-title" style={{ fontSize: '2.2rem' }}>404 - Page Not Found</h1>
      <p className="empty-state-text">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary" style={{ width: 'auto' }}>
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
