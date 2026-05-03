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
        <div className="auth-brand">
          <Zap size={64} color="var(--accent)" className="logo-icon" />
          <h1>SwiftCourier</h1>
          <p>Industrial Precision Delivery System</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Forgot Password</h2>
          
          {success ? (
            <div>
              <p className="subtitle" style={{ color: 'var(--success)' }}>
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <div style={{ marginTop: '2rem' }}>
                 <Link to="/login" className="btn btn-primary auth-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>Return to Login</Link>
              </div>
            </div>
          ) : (
            <>
              <p className="subtitle">Enter your registered email address and we'll send you a link to reset your password.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    className="input-field" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    placeholder="you@example.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="auth-footer">
                Remembered your password? <Link to="/login">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
