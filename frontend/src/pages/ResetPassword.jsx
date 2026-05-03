import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/authApi';
import { Zap } from 'lucide-react';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      addToast('Password reset successfully. You can now log in.', 'success');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password.';
      setErrorMsg(msg);
      addToast(msg, 'error');
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
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80" 
            alt="Logistics" 
          />
          <div className="auth-bg-overlay"></div>
        </div>
        
        <div className="auth-brand">
          <Zap size={32} className="logo-icon" />
          <span className="auth-brand-text">SwiftCourier</span>
        </div>
        
        <div className="auth-value-prop">
          <h1>Finalize Recovery.</h1>
          <p>Secure your account with a new set of credentials. Our end-to-end encryption ensures your data remains private.</p>
        </div>
        
        <div className="auth-footer-info">
          <div className="auth-footer-line"></div>
          <span className="auth-footer-text">Institutional Stability Since 1998</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create New Password</h2>
            <p>{errorMsg ? 'Invalid Token' : 'Enter your new password below to finalize account recovery.'}</p>
          </div>
          
          {errorMsg ? (
             <div className="auth-form">
               <div className="auth-error-banner">
                 <p>{errorMsg}</p>
               </div>
               <Link to="/forgot-password" className="auth-submit-btn" style={{ textDecoration: 'none' }}>
                 Request New Link
               </Link>
             </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="password">New Password</label>
                <input 
                  id="password" 
                  type="password" 
                  className="auth-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  className="auth-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Updating Credentials...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
