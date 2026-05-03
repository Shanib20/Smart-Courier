import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import './Layout.css';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="navbar-divider"></div>
        <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="navbar-brand">
          SmartCourier
        </Link>
      </div>

      <div className="navbar-right">
        {user?.role !== 'ADMIN' && <NotificationBell />}
        
        <div className="navbar-profile-section">
          {user?.name && (
            <Link to="/profile" className="user-info-link">
              <div className="user-info-text">
                <p className="user-name-text">{user.name}</p>
                <p className="user-role-text">{user.role === 'ADMIN' ? 'Administrator' : 'Premium Member'}</p>
              </div>
            </Link>
          )}
          
          <Link to="/profile">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt="User avatar" 
                className="user-avatar" 
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`} 
                alt="User avatar" 
                className="user-avatar" 
              />
            )}
          </Link>
          
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
