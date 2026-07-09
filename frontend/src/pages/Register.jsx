import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Shield, Eye, EyeOff, Check, X, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear context errors on load/unload
  useEffect(() => {
    if (setError) setError(null);
  }, [setError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  // Password rules validation
  const password = formData.password;
  const validation = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const strengthScore = Object.values(validation).filter(Boolean).length;
  
  const getStrengthClass = () => {
    if (strengthScore <= 1) return 'weak';
    if (strengthScore <= 3) return 'medium';
    return 'strong';
  };

  const getStrengthLabel = () => {
    if (!password) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore <= 3) return 'Medium / Good';
    return 'Strong & Secure';
  };

  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;
  const isPasswordValid = Object.values(validation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setLocalError('Password must meet all requirement checklist rules.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setLocalError('');
    
    const res = await register(formData.name, formData.email, formData.password, formData.role);
    if (res.success) {
      navigate('/login', { state: { message: 'Registration successful! Please login with your credentials.' } });
    }
    setLoading(false);
  };

  return (
    <div className="container flex justify-center items-center page-enter" style={{ minHeight: '80vh', padding: '2rem 1.5rem' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex justify-center mb-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <UserPlus size={32} />
          </div>
        </div>

        <h2 className="heading-secondary text-center mb-2">Create an Account</h2>
        <p className="text-center text-muted mb-6" style={{ fontSize: '0.95rem' }}>Join BidMaster and start placing bids today</p>
        
        {(error || localError) && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-leading-icon" size={18} />
              <input 
                type="text" 
                name="name"
                className="form-control form-control-icon" 
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-leading-icon" size={18} />
              <input 
                type="email" 
                name="email"
                className="form-control form-control-icon" 
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
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
                name="password"
                className="form-control form-control-icon" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
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

            {/* Password Strength Meter */}
            {password && (
              <div className="strength-meter-container">
                <div className="flex justify-between items-center">
                  <span className="strength-text">Password Strength:</span>
                  <span className={`strength-text text-${getStrengthClass()}`}>{getStrengthLabel()}</span>
                </div>
                <div className="strength-meter-bar">
                  <div className={`strength-meter-fill ${getStrengthClass()}`} />
                </div>
                
                {/* Rules Checklist */}
                <div className="validation-checklist">
                  <div className={`validation-item ${validation.minLength ? 'valid' : 'invalid'}`}>
                    {validation.minLength ? <Check size={14} /> : <X size={14} />}
                    <span>Min 6 characters</span>
                  </div>
                  <div className={`validation-item ${validation.hasUppercase ? 'valid' : 'invalid'}`}>
                    {validation.hasUppercase ? <Check size={14} /> : <X size={14} />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`validation-item ${validation.hasNumber ? 'valid' : 'invalid'}`}>
                    {validation.hasNumber ? <Check size={14} /> : <X size={14} />}
                    <span>One number</span>
                  </div>
                  <div className={`validation-item ${validation.hasSpecialChar ? 'valid' : 'invalid'}`}>
                    {validation.hasSpecialChar ? <Check size={14} /> : <X size={14} />}
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-leading-icon" size={18} />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword"
                className="form-control form-control-icon" 
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required 
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center gap-1 mt-2" style={{ fontSize: '0.8rem' }}>
                {passwordsMatch ? (
                  <span className="flex items-center gap-1 text-accent"><Check size={14} /> Passwords match</span>
                ) : (
                  <span className="flex items-center gap-1 text-danger"><X size={14} /> Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="input-icon-wrapper">
              <Shield className="input-leading-icon" size={18} />
              <select 
                name="role" 
                className="form-control form-control-icon" 
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Buyer (I want to bid)</option>
                <option value="seller">Seller (I want to create auctions)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={loading || !isPasswordValid || !passwordsMatch}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-muted" style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" className="text-primary" style={{ fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

