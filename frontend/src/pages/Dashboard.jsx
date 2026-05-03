import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { deliveryApi } from '../api/deliveryApi';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  ChevronRight, 
  TrendingUp,
  CreditCard,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCount: 0,
    deliveredCount: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await deliveryApi.getMyDeliveries(0, 100);
        const all = response.content || [];
        
        const active = all.filter(d => ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length;
        const delivered = all.filter(d => d.status === 'DELIVERED').length;
        const spent = all.reduce((acc, curr) => acc + (curr.chargeAmount || 0), 0);

        setStats({
          activeCount: active,
          deliveredCount: delivered,
          totalSpent: spent
        });
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

  return (
    <div className="dashboard-container slide-up">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1>{getGreeting()}, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="subtitle">Welcome back. You have {stats.activeCount} active shipments in transit.</p>
        </div>
        <Link to="/deliveries/new" className="btn btn-primary btn-lg">
          <PlusCircle size={20} /> Book New Delivery
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Active Deliveries" 
          value={loading ? "..." : stats.activeCount} 
          icon={Package}
          trend="Real-time tracking"
        />
        <StatCard 
          title="Delivered" 
          value={loading ? "..." : stats.deliveredCount} 
          icon={CheckCircle}
          trend="Successfully completed"
        />
        <StatCard 
          title="Total Logistics Spend" 
          value={loading ? "..." : `₹${stats.totalSpent.toLocaleString()}`} 
          icon={CreditCard}
          trend="Lifetime spending"
        />
      </div>

      <div className="dashboard-sections">
        <div className="section-main">
          <div className="section-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <Link to="/deliveries" className="action-card">
                <div className="action-icon purple"><History size={24}/></div>
                <div className="action-text">
                  <h4>Delivery History</h4>
                  <p>View receipts and invoices</p>
                </div>
                <ChevronRight size={18} />
              </Link>
              <Link to="/track" className="action-card">
                <div className="action-icon blue"><Clock size={24}/></div>
                <div className="action-text">
                  <h4>Track Shipment</h4>
                  <p>Check status in real-time</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="section-side">
          <div className="promo-card">
            <div className="promo-content">
              <TrendingUp size={32} className="promo-icon" />
              <h4>Next-Day Delivery</h4>
              <p>Upgrade to Express for guaranteed delivery by tomorrow morning.</p>
              <button 
                className="coming-soon-btn" 
                onClick={() => addToast('Express Next-Day delivery is coming soon to your city!', 'info')}
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
