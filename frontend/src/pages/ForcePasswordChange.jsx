import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { profileApi } from '../api/profileApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { Zap } from 'lucide-react';
import './Auth.css';

export default function ForcePasswordChange() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const { addToast } = useToast();
  const { login } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If no email was passed in state, bounce back to login
  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.forceChangePassword({ email, oldPassword, newPassword: password });
      addToast('Password updated successfully. Please log in with your new password.', 'success');
      navigate('/login');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update password.', 'error');
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
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80" 
            alt="Cargo" 
          />
          <div className="auth-bg-overlay"></div>
        </div>
        
        <div className="auth-brand">
          <Zap size={32} className="logo-icon" />
          <span className="auth-brand-text">SwiftCourier</span>
        </div>
        
        <div className="auth-value-prop">
          <h1>Security Mandate.</h1>
          <p>For security reasons, all institutional accounts require a mandatory credential refresh on first access. This ensures your dashboard remains exclusive to you.</p>
        </div>
        
        <div className="auth-footer-info">
          <div className="auth-footer-line"></div>
          <span className="auth-footer-text">Institutional Stability Since 1998</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Update Required</h2>
            <p>Please change your temporary password before accessing the logistics dashboard.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="oldPassword">Temporary Password</label>
              <input 
                id="oldPassword" 
                type="password" 
                className="auth-input" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required 
                placeholder="Enter temporary password"
              />
            </div>
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
              <label htmlFor="confirmPassword">Confirm New Password</label>
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
              {loading ? 'Processing Update...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
