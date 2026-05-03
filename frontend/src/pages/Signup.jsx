import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/authApi';
import { Zap } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
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
        <div className="auth-brand">
          <Zap size={64} color="var(--accent)" className="logo-icon" />
          <h1>SwiftCourier</h1>
          <p>Industrial Precision Delivery System</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h2>Create Account</h2>
          <p className="subtitle">{isOtpStep ? 'Verify your email address.' : 'Join our logistics network today.'}</p>
          
          {isOtpStep ? (
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input 
                  id="otp" 
                  name="otp"
                  type="text" 
                  className="input-field" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  placeholder="123456"
                />
              </div>
              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  name="name"
                  type="text" 
                  className="input-field" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  className="input-field" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password" 
                  name="password"
                  type="password" 
                  className="input-field" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <select 
                  id="role" 
                  name="role"
                  className="input-field" 
                  value={formData.role}
                  onChange={handleChange}
                  style={{ appearance: 'auto' }}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
