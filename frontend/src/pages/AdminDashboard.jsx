import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../hooks/useToast';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Server,
  ChevronRight,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import './AdminDashboard.css';

const HealthWidget = ({ health }) => {
  if (!health) return <div className="skeleton" style={{ height: '200px' }}></div>;

  return (
    <div className="dashboard-card health-card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Server size={20} className="text-accent" />
          <h3>System Health</h3>
        </div>
        <span className={`status-pill ${health.systemStatus === 'HEALTHY' ? 'positive' : 'warning'}`}>
          {health.systemStatus === 'HEALTHY' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
          {health.systemStatus}
        </span>
      </div>
      <div className="health-grid">
        {Object.entries(health.services).map(([name, status]) => (
          <div key={name} className="health-item">
            <span className="service-name">{name.replace('-service', '')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`status-dot ${status === 'UP' ? 'online' : 'offline'}`}></span>
              <span className="status-text">{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities }) => {
  if (!activities) return <div className="skeleton" style={{ height: '300px' }}></div>;

  return (
    <div className="dashboard-card activity-card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={20} className="text-accent" />
          <h3>Recent Operations</h3>
        </div>
      </div>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="empty-msg">No recent activity detected.</p>
        ) : (
          activities.map((act, i) => (
            <div key={i} className="activity-item-row">
              <div className={`status-icon-bg ${act.status.toLowerCase()}`}>
                <Package size={16} />
              </div>
              <div className="activity-info">
                <div className="activity-top">
                  <span className="tracking">#{act.trackingNumber}</span>
                  <span className={`badge ${act.status.toLowerCase()}`}>{act.status}</span>
                </div>
                <div className="activity-details">
                  {act.senderName} → {act.receiverName}
                </div>
              </div>
              <div className="activity-time">
                <Clock size={12} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, healthData, activityData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getHealth(),
        adminApi.getRecentActivity()
      ]);
      setStats(statsData);
      setHealth(healthData);
      setActivity(activityData);
    } catch (err) {
      addToast('Failed to sync live dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  const barData = stats ? [
    { name: 'Booked', count: stats.bookedCount },
    { name: 'In Transit', count: stats.inTransitCount },
    { name: 'Delivered', count: stats.deliveredCount },
    { name: 'Failed', count: stats.failedCount },
  ] : [];

  return (
    <div className="admin-dashboard slide-up">
      <div className="page-header">
        <div>
          <h1>Global Control Center</h1>
          <p className="subtitle">Real-time microservices monitor and logistics analytics.</p>
        </div>
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          LIVE MONITORING
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Shipments"
          value={loading && !stats ? '...' : stats?.totalDeliveries}
          icon={Package}
        />
        <StatCard 
          title="Active Hubs"
          value={loading && !stats ? '...' : stats?.totalHubs}
          icon={TrendingUp}
        />
        <StatCard 
          title="Success Rate"
          value={loading && !stats ? '...' : stats?.totalDeliveries > 0 ? `${Math.round((stats.deliveredCount / stats.totalDeliveries) * 100)}%` : '0%'}
          icon={CheckCircle2}
          trend="Based on real volume"
        />
        <StatCard 
          title="Est. Revenue"
          value={loading && !stats ? '...' : `₹${((stats?.totalDeliveries || 0) * 245).toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <div className="dashboard-main-grid">
        <div className="grid-left">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Volume Distribution</h3>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ActivityFeed activities={activity} />
        </div>

        <div className="grid-right">
          <HealthWidget health={health} />
          
          <div className="dashboard-card insights-card">
            <h3>System Insights</h3>
            <div className="insight-item">
              <div className="insight-icon info"><AlertCircle size={16} /></div>
              <div className="insight-text">
                <p><strong>Auto-Sync Active</strong></p>
                <span>Dashboard refreshes every 30 seconds via Actuator.</span>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon success"><CheckCircle2 size={16} /></div>
              <div className="insight-text">
                <p><strong>Database Optimized</strong></p>
                <span>Demo records cleared. System running on production data.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
