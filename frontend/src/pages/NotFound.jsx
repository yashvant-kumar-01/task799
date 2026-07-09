import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container flex-col items-center justify-center text-center" style={{ minHeight: '70vh' }}>
      <h1 className="heading-primary" style={{ fontSize: '6rem', marginBottom: '0' }}>404</h1>
      <h2 className="heading-secondary">Page Not Found</h2>
      <p className="text-muted mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Go Back Home</Link>
    </div>
  );
};

export default NotFound;
