import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import usePageTitle from '../hooks/usePageTitle';
import { authApi } from '../api/authApi';
import { Package, LogIn, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Login() {
  usePageTitle('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="auth-bg-wrapper">
          <img 
            className="auth-bg-image" 
            src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1920&q=80" 
            alt="Warehouse" 
          />
          <div className="auth-bg-overlay"></div>
        </div>
        
        <div className="auth-brand">
          <Package size={32} className="logo-icon" />
          <span className="auth-brand-text">SmartCourier</span>
        </div>
        
        <div className="auth-value-prop">
          <h1>Global logistics managed with surgical precision.</h1>
          <p>Experience the future of supply chain management. Real-time tracking, intelligent routing, and automated manifest control in one unified command center.</p>
        </div>
        
        <div className="auth-footer-info">
          <div className="auth-footer-line"></div>
          <span className="auth-footer-text">Institutional Stability Since 1998</span>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>{isOtpStep ? 'Enter the 2FA code sent to your email.' : 'Enter your credentials to access the logistics dashboard.'}</p>
          </div>
          
          {error && (
            <div className="auth-error-banner">
              <p>{error}</p>
            </div>
          )}
          
          {isOtpStep ? (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="auth-form-group">
                <label htmlFor="otp">Enter 2FA Code</label>
                <input 
                  id="otp" 
                  type="text" 
                  className="auth-input" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  placeholder="123456"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
                <LogIn size={18} />
              </button>
            </form>
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
              <div className="auth-form-group">
                <div className="auth-form-group-header">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="auth-forgot-link">Forgot Password?</Link>
                </div>
                <div className="password-input-wrapper">
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    className="auth-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <LogIn size={18} />
              </button>
            </form>
          )}
          
          <div className="auth-footer-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
