import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/authApi';
import { Zap } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(true);
      addToast(response.message || 'Reset link sent.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to send reset link.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-bg-wrapper">
          <img 
            className="auth-bg-image" 
            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&w=1920&q=80" 
            alt="Logistics" 
          />
          <div className="auth-bg-overlay"></div>
        </div>
        
        <div className="auth-brand">
          <Zap size={32} className="logo-icon" />
          <span className="auth-brand-text">SwiftCourier</span>
        </div>
        
        <div className="auth-value-prop">
          <h1>Security First.</h1>
          <p>Protecting your global supply chain starts with secure access. Reset your credentials using our encrypted recovery system.</p>
        </div>
        
        <div className="auth-footer-info">
          <div className="auth-footer-line"></div>
          <span className="auth-footer-text">Institutional Stability Since 1998</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Reset Password</h2>
            <p>Enter your registered email address and we'll send you a link to reset your password.</p>
          </div>
          
          {success ? (
            <div className="auth-form">
              <div className="auth-error-banner" style={{ backgroundColor: '#e6fffa', color: '#234e52', border: '1px solid #b2f5ea' }}>
                <p>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
              </div>
              <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  className="auth-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="name@company.com"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
              
              <div className="auth-footer-link">
                Remembered your password? <Link to="/login">Sign in</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
