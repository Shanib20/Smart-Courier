import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { 
  Users, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Server,
  ChevronRight,
  ChevronLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  RefreshCw,
  MapPin,
  ArrowRight,
  Eye,
  Briefcase,
  Layers,
  Globe
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './AdminDashboard.css';

const StatCardPremium = ({ title, value, icon: Icon, trend, trendType }) => (
  <div className="stat-card-premium">
    <div className="stat-card-top">
      <div className="stat-icon-box">
        <Icon size={18} />
      </div>
      {trend && (
        <span className={`stat-trend ${trendType || 'neutral'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, healthData, activityData, reportsData, hubsData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getHealth(),
        adminApi.getRecentActivity(),
        adminApi.getReports(),
        adminApi.getHubs()
      ]);

      // Ensure data consistency between dashboard and reports
      const consolidatedStats = {
        ...statsData,
        totalDeliveries: reportsData.totalDeliveries,
        deliveredCount: reportsData.delivered,
        inTransitCount: reportsData.inTransit,
        totalHubs: statsData.totalHubs, // Explicitly set from backend-filtered stats
      };

      setStats(consolidatedStats);
      setHealth(healthData);
      setActivity(activityData || []);
    } catch (err) {
      addToast('Failed to sync live dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleExportCSV = () => {
    if (!activity.length) return addToast('No data to export', 'warning');
    
    const headers = ['Tracking ID', 'Sender', 'Receiver', 'Status', 'Date'];
    const rows = activity.map(act => [
      act.trackingNumber,
      act.senderName,
      act.receiverName,
      act.status,
      new Date().toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_activity_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported successfully', 'success');
  };

  const barData = stats?.revenueTrend ? stats.revenueTrend.map(point => ({
    name: point.date, 
    count: point.amount
  })) : stats ? [
    { name: 'Mon', count: Math.floor(stats.bookedCount * 0.4) },
    { name: 'Tue', count: Math.floor(stats.bookedCount * 0.6) },
    { name: 'Wed', count: Math.floor(stats.bookedCount * 0.5) },
    { name: 'Thu', count: stats.bookedCount },
    { name: 'Fri', count: stats.inTransitCount },
    { name: 'Sat', count: stats.deliveredCount },
    { name: 'Sun', count: Math.floor(stats.deliveredCount * 0.8) },
  ] : [];

  const filteredActivity = activity.filter(act => 
    act.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-wrapper">
      <div className="admin-max-width">
        
        {/* Header Actions */}
        <div className="admin-header">
          <div>
            <h1>System Overview</h1>
            <p>Real-time logistics performance and network status.</p>
          </div>
          <div className="admin-actions">
            <button className="btn-admin-ghost" onClick={handleExportCSV}>
              <Download size={16} />
              Export Report
            </button>
            <button className="btn-admin-solid" onClick={loadData}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-row">
          <StatCardPremium 
            title="Total Revenue" 
            value={loading ? '' : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend={stats?.revenueTrendLabel}
            trendType={stats?.revenueTrendType}
          />
          <StatCardPremium 
            title="Active Shipments" 
            value={loading ? '' : stats?.inTransitCount || 0}
            icon={Activity}
            trend={stats?.activeTrendLabel}
            trendType={stats?.activeTrendType}
          />
          <StatCardPremium 
            title="Pending" 
            value={loading ? '' : stats?.bookedCount || 0}
            icon={Clock}
            trend={stats?.pendingTrendLabel}
            trendType={stats?.pendingTrendType}
          />
          <StatCardPremium 
            title="Total Deliveries" 
            value={loading ? '' : stats?.totalDeliveries || 0}
            icon={Package}
            trend={stats?.totalTrendLabel}
            trendType={stats?.totalTrendType}
          />
          <StatCardPremium 
            title="Total Hubs" 
            value={loading ? '' : stats?.totalHubs || 0}
            icon={Layers}
            trend={stats?.hubsTrendLabel}
            trendType={stats?.hubsTrendType}
          />
        </div>

          {/* Top Visualization Row: Chart & Health */}
          <div className="admin-grid">
            <div className="admin-main">
              {/* Delivery Performance Chart */}
              <div className="bento-card">
                <div className="bento-card-header">
                  <h3>Delivery Performance</h3>
                  <div className="chart-filter-tabs">
                    <button 
                      className={`chart-tab ${activeRange === 'Weekly' ? 'active' : ''}`}
                      onClick={() => setActiveRange('Weekly')}
                    >Weekly</button>
                    <button 
                      className={`chart-tab ${activeRange === 'Monthly' ? 'active' : ''}`}
                      onClick={() => setActiveRange('Monthly')}
                    >Monthly</button>
                  </div>
                </div>
                <div className="bento-card-body">
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 5 ? '#0051d5' : '#bfdbfe'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-side">
              {/* Network Health */}
              <div className="bento-card">
                <div className="bento-card-header">
                  <h3>Network Health</h3>
                </div>
                <div className="bento-card-body">
                  {loading ? null : health ? (
                    Object.entries(health.services).map(([name, status]) => (
                      <div key={name} className="health-item-row">
                        <div className="health-label">
                          <span className={`status-indicator ${status === 'UP' ? 'online' : 'offline'}`}></span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{name.replace('-service', '').toUpperCase()}</span>
                        </div>
                        <span className="health-val">{status === 'UP' ? '99.9%' : 'OFFLINE'}</span>
                      </div>
                    ))
                  ) : (
                    <p>Loading health data...</p>
                  )}

                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Hub Map</span>
                      <a href="#" style={{ fontSize: '11px', fontWeight: 600, color: '#0051d5', textDecoration: 'none' }}>View All</a>
                    </div>
                    <div className="map-container">
                      <img src="/images/logistics_network.png" alt="Logistics Network Map" className="map-img" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Full-Width Recent System Activity */}
          <div className="bento-card" style={{ marginTop: '8px' }}>
            <div className="bento-card-header">
              <h3>Operational Journey Log</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>User Account</th>
                    <th>Journey Detail</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                     <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Syncing Log...</td></tr>
                  ) : filteredActivity.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        No operational logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredActivity.map((act, i) => (
                      <tr key={i}>
                        <td><span className="tracking-id">#{act.trackingNumber}</span></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{act.senderName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>System User</div>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                            {act.status === 'BOOKED' ? 'Shipment registered at Origin' : 
                             act.status === 'IN_TRANSIT' ? '[HUB-CEN-110001] - Inbound transit processing' :
                             act.status === 'DELIVERED' ? 'Successfully handed to receiver' : 
                             act.status === 'OUT_FOR_DELIVERY' ? `[HUB-CEN-110001] - Driver dispatched to Destination` :
                             `Operational update: ${act.status}`}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                          {act.createdAt ? (
                            (() => {
                              const d = new Date(act.createdAt);
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              const hours = String(d.getHours()).padStart(2, '0');
                              const mins = String(d.getMinutes()).padStart(2, '0');
                              return `${day}/${month}/${year} • ${hours}:${mins}`;
                            })()
                          ) : '04/05/2026 • 02:30'}
                        </td>
                        <td>
                          <span className={`status-badge ${act.status.toLowerCase()}`}>
                            {act.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination-footer">
              <span style={{ color: '#64748b', fontSize: '13px' }}>Showing the latest operational logs</span>
            </div>
          </div>
      </div>
    </div>
  );
}
