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
        <div className="auth-brand">
          <Zap size={64} color="var(--accent)" className="logo-icon" />
          <h1>SwiftCourier</h1>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Create New Password</h2>
          
          {errorMsg ? (
             <div style={{ textAlign: 'center' }}>
               <p className="subtitle" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
               <div style={{ marginTop: '2rem' }}>
                 <Link to="/forgot-password" className="btn btn-outline" style={{ textDecoration: 'none', display: 'block' }}>
                   Request new link
                 </Link>
               </div>
             </div>
          ) : (
            <>
              <p className="subtitle">Enter your new password below.</p>
              <form onSubmit={handleSubmit}>
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
                  <label htmlFor="confirmPassword">Confirm Password</label>
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
                  {loading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
