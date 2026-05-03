import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Package, 
  Search, 
  Headset, 
  FileText, 
  Building2,
  Shield,
  IndianRupee,
  X 
} from 'lucide-react';
import './Layout.css';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const customerLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/deliveries/new', icon: <PackagePlus size={20} />, label: 'New Delivery' },
    { to: '/deliveries', icon: <Package size={20} />, label: 'My Deliveries' },
    { to: '/track', icon: <Search size={20} />, label: 'Track Parcel' },
    { to: '/support', icon: <Headset size={20} />, label: 'Support' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/deliveries', icon: <Package size={20} />, label: 'All Deliveries' },
    { to: '/admin/reports', icon: <FileText size={20} />, label: 'Reports' },
    { to: '/admin/hubs', icon: <Building2 size={20} />, label: 'Hub Management' },
    { to: '/admin/users', icon: <Shield size={20} />, label: 'User Management' },
    { to: '/admin/pricing', icon: <IndianRupee size={20} />, label: 'Pricing Rules' },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header mobile-only">
        <span className="sidebar-title">Menu</span>
        <button className="btn-icon" onClick={closeSidebar}>
          <X size={24} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
