import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, Zap, Search } from 'lucide-react';
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
        <button className="menu-toggle btn-icon" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="logo">
          <Zap className="logo-icon" size={24} color="var(--accent)" />
          <span>SwiftCourier</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user?.role !== 'ADMIN' && <NotificationBell />}
        {user?.name && (
          <Link to="/profile" className="user-profile" style={{ textDecoration: 'none' }}>
            <span className="user-role-badge">{user.role}</span>
            <span className="user-name">{user.name}</span>
          </Link>
        )}
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
