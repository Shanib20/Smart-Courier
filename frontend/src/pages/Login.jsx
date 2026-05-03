import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/authApi';
import { Zap } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLoginSuccess = (response) => {
    if (response.requiresPasswordChange) {
      navigate('/force-password-change', { state: { email } });
      return;
    }
    
    login(response);
    addToast('Login successful!', 'success');
    if (response.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.requiresOtp) {
        setIsOtpStep(true);
        addToast('2FA code sent to your email.', 'success');
      } else {
        handleLoginSuccess(response);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      if (msg.includes('suspended')) {
        setError(msg);
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.verify2FA({ email, otp: otp.trim() });
      handleLoginSuccess(response);
    } catch (error) {
      addToast(error.response?.data?.message || 'Invalid OTP.', 'error');
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
          <h2>Welcome Back</h2>
          <p className="subtitle">{isOtpStep ? 'Enter the 2FA code sent to your email.' : 'Enter your credentials to access your account.'}</p>
          
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}
          
          {isOtpStep ? (
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label htmlFor="otp">Enter 2FA Code</label>
                <input 
                  id="otp" 
                  type="text" 
                  className="input-field" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  placeholder="123456"
                />
              </div>
              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          ) : (
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
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password" 
                  type="password" 
                  className="input-field" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Forgot Password?</Link>
                </div>
              </div>
              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
