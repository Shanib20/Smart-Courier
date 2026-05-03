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
        <div className="auth-brand">
          <Zap size={64} color="var(--accent)" className="logo-icon" />
          <h1>SwiftCourier</h1>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Update Required</h2>
          <p className="subtitle" style={{ color: 'var(--warning)' }}>
            For security reasons, you must change your temporary password before accessing the dashboard.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="oldPassword">Temporary Password</label>
              <input 
                id="oldPassword" 
                type="password" 
                className="input-field" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input 
                id="password" 
                type="password" 
                className="input-field" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                className="input-field" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength={6}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
