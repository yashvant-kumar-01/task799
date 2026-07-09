import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Clear errors when navigating away or loading the page
  useEffect(() => {
    if (setError) setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    
    const res = await login(email, password);
    if (res.success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/auctions');
    }
    setLoading(false);
  };

  return (
    <div className="container flex justify-center items-center page-enter" style={{ minHeight: '75vh' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex justify-center mb-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <LogIn size={32} />
          </div>
        </div>
        
        <h2 className="heading-secondary text-center mb-2">Welcome Back</h2>
        <p className="text-center text-muted mb-6" style={{ fontSize: '0.95rem' }}>Login to access your BidMaster account</p>
        
        {successMessage && (
          <div className="alert alert-success">
            <span>{successMessage}</span>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-leading-icon" size={18} />
              <input 
                type="email" 
                className="form-control form-control-icon" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-leading-icon" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control form-control-icon" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember me</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-muted" style={{ fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" className="text-primary" style={{ fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

