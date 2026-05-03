import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/authApi';
import { Package, UserPlus, Eye, EyeOff } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import './Auth.css';

export default function Signup() {
  usePageTitle('Signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.signup(formData);
      if (response.requiresOtp) {
        setIsOtpStep(true);
        addToast('OTP sent to your email!', 'success');
      } else {
        // Fallback if not requiresOtp
        login(response);
        navigate(response.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyEmail({ email: formData.email, otp: otp.trim() });
      addToast('Email verified successfully! Please login.', 'success');
      navigate('/login');
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
            <h2>Create Account</h2>
            <p>{isOtpStep ? 'Verify your email address.' : 'Join our logistics network today.'}</p>
          </div>
          
          {isOtpStep ? (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="auth-form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input 
                  id="otp" 
                  name="otp"
                  type="text" 
                  className="auth-input" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  placeholder="123456"
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Verifying...' : 'Verify Email'}</span>
                <UserPlus size={18} />
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  name="name"
                  type="text" 
                  className="auth-input" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  className="auth-input" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="you@example.com"
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    className="auth-input" 
                    value={formData.password}
                    onChange={handleChange}
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
              <div className="auth-form-group">
                <label htmlFor="role">Account Type</label>
                <select 
                  id="role" 
                  name="role"
                  className="auth-input" 
                  value={formData.role}
                  onChange={handleChange}
                  style={{ appearance: 'auto' }}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                <UserPlus size={18} />
              </button>
            </form>
          )}
          
          <div className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
