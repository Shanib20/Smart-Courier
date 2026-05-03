import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import { 
  Package, 
  CheckCircle, 
  TrendingUp,
  CreditCard,
  Truck,
  Eye,
  LocateFixed,
  Plus,
  Warehouse,
  PlaneTakeoff,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    activeCount: 0,
    deliveredCount: 0,
    totalSpent: 0,
    totalCount: 0
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await deliveryApi.getMyDeliveries(0, 100);
        const all = response.content || [];
        
        const active = all.filter(d => ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status));
        const delivered = all.filter(d => d.status === 'DELIVERED').length;
        const spent = all
          .filter(d => d.status !== 'CANCELLED')
          .reduce((acc, curr) => acc + (curr.chargeAmount || 0), 0);

        setStats({
          activeCount: active.length,
          deliveredCount: delivered,
          totalSpent: spent,
          totalCount: all.length
        });
        
        setRecentDeliveries(all.slice(0, 5));

        // Extract unique destination cities for the map
        const cities = [...new Set(active.map(d => d.destinationAddress?.city).filter(Boolean))].slice(0, 3);
        setActiveLocations(cities);

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="dashboard-container slide-up">
      {/* Greeting & Quick Actions */}
      <div className="dashboard-header-row">
        <div className="dashboard-greeting">
          <h2>{getGreeting()}, {user?.name.split(' ')[0]}</h2>
          <p>Here is what is happening with your deliveries today.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/track" className="btn-secondary">
            <LocateFixed size={18} />
            Track a Parcel
          </Link>
          <Link to="/deliveries/new" className="btn-primary">
            <Plus size={18} />
            Book New Delivery
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-header">
            <p>Total Deliveries</p>
            <Package size={20} className="stat-icon" />
          </div>
          <div>
            <p className="stat-value">{loading ? "..." : stats.totalCount}</p>
            <p className="stat-trend positive">
              <TrendingUp size={14} />
              Lifetime shipments
            </p>
          </div>
        </div>
        
        <div className="dashboard-stat-card">
          <div className="stat-header">
            <p>In Transit</p>
            <Truck size={20} className="stat-icon blue" />
          </div>
          <div>
            <p className="stat-value">{loading ? "..." : stats.activeCount}</p>
            <p className="stat-trend">Active shipments currently</p>
          </div>
        </div>
        
        <div className="dashboard-stat-card">
          <div className="stat-header">
            <p>Completed</p>
            <CheckCircle size={20} className="stat-icon emerald" />
          </div>
          <div>
            <p className="stat-value">{loading ? "..." : stats.deliveredCount}</p>
            <p className="stat-trend">Successfully delivered</p>
          </div>
        </div>
        
        <div className="dashboard-stat-card">
          <div className="stat-header">
            <p>Spendings</p>
            <CreditCard size={20} className="stat-icon" />
          </div>
          <div>
            <p className="stat-value">{loading ? "..." : `₹${stats.totalSpent.toLocaleString()}`}</p>
            <p className="stat-trend">Total lifetime spending</p>
          </div>
        </div>
      </div>

      {/* Content Area: Asymmetric Layout */}
      <div className="dashboard-content-area">
        {/* Recent Activity Table (2/3 width) */}
        <div className="dashboard-table-card">
          <div className="table-header-box">
            <h3>Recent Activity</h3>
            <Link to="/deliveries" className="table-view-all">View All</Link>
          </div>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Date</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>Loading deliveries...</td></tr>
                ) : recentDeliveries.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No recent deliveries found.</td></tr>
                ) : (
                  recentDeliveries.map(delivery => (
                    <tr key={delivery.id}>
                      <td className="td-id">{delivery.trackingId || `SC-${delivery.id}`}</td>
                      <td className="td-date">{formatDate(delivery.createdAt)}</td>
                      <td>
                        <span className="td-recipient-name">{delivery.recipientName}</span>
                        <span className="td-recipient-loc">{delivery.destinationAddress?.city || 'Unknown City'}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${delivery.status.toLowerCase()}`}>
                          {delivery.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/deliveries/${delivery.id}`} className="action-btn">
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Tracking Map / Promo (1/3 width) */}
        <div className="dashboard-side-col">
          <div className="map-card">
            <div className="map-header">
              <h3>Global Coverage</h3>
              <p>Real-time terminal operations</p>
            </div>
            <div className="map-visual">
              <div className="map-gradient"></div>
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Map View" 
              />
              <div className="map-ping">
                <div className="ping-ring"></div>
                <div className="ping-dot"></div>
              </div>
            </div>
            <div className="map-locations">
              {activeLocations.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>No active deliveries on map.</p>
              ) : (
                activeLocations.map((city, index) => (
                  <div className="map-loc-item" key={index}>
                    <div className="map-loc-icon">
                      {index === 0 ? <Warehouse size={20} /> : <PlaneTakeoff size={20} />}
                    </div>
                    <div className="map-loc-info">
                      <p className="loc-name">{city} Terminal</p>
                      <p className="loc-status">Status: Active Routing</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="promo-card">
            <div className="promo-content">
              <h4>Freight Insurance</h4>
              <p>Protect your high-value shipments with our new automated cargo insurance program. Instant claims and global coverage.</p>
              <button 
                className="promo-link-btn"
                onClick={() => addToast('Freight Insurance feature is coming soon!', 'info')}
              >
                LEARN MORE <ArrowRight size={14} />
              </button>
            </div>
            <ShieldCheck size={120} className="promo-bg-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
