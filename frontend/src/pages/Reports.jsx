import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Download,
  RefreshCcw,
  Calendar,
  MoreHorizontal,
  Circle,
  Target,
  Bolt,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { adminApi } from '../api/adminApi';
import { deliveryApi } from '../api/deliveryApi';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import './Reports.css';

const SkeletonCard = () => (
  <div className="kpi-card skeleton-card">
    <div className="skeleton skeleton-title" style={{ height: '14px', width: '60%', background: '#f1f5f9' }}></div>
    <div className="skeleton skeleton-value" style={{ height: '32px', width: '80%', background: '#f1f5f9', marginTop: '12px' }}></div>
  </div>
);

export default function Reports() {
  usePageTitle('System Reports');
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(7);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await adminApi.getAnalytics(range);
      setData(response);
    } catch (err) {
      setError(true);
      addToast('Failed to sync analytics engine', 'error');
    } finally {
      setLoading(false);
    }
  }, [range, addToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportCSV = () => {
    if (!data) return;
    addToast('Generating detailed breakdown...', 'info');
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "SUMMARY METRICS\n";
      csvContent += `Success Rate,${data.successRate}%\n`;
      csvContent += `Avg Delivery SLA,${data.avgDeliveryDays} Days\n`;
      csvContent += `Cancellation Rate,${data.cancellationRate}%\n\n`;
      csvContent += "REVENUE TREND\nDate,Amount\n";
      data.revenueTrend.forEach(row => { csvContent += `${row.date},${row.amount}\n`; });
      csvContent += "\n";
      csvContent += "TOP SHIPPING ROUTES\nFrom,To,Bookings,Revenue\n";
      data.topRoutes.forEach(route => {
        csvContent += `${route.fromPincode},${route.toPincode},${route.count},${route.revenue}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SmartCourier_Analytics_${range}d.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('CSV Exported successfully', 'success');
    } catch (err) {
      addToast('Export failed', 'error');
    }
  };

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-card" style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px' }}>
          <AlertCircle size={64} color="#f43f5e" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Analytics Engine Offline</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>We couldn't aggregate the latest delivery metrics.</p>
          <button className="btn-export" onClick={fetchAnalytics} style={{ margin: '0 auto' }}>
            <RefreshCcw size={18} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = data?.revenueTrend.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return (
    <div className="reports-container slide-up">
      <div className="analytics-header">
        <div>
          <h1>System Intelligence</h1>
          <p className="subtitle">Real-time performance and financial analytics across all logistic clusters.</p>
        </div>
        <div className="reports-controls">
          <div className="range-selector">
            <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last Quarter</option>
            </select>
          </div>
          <button className="btn-export" onClick={exportCSV}>
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <div className="kpi-card">
              <div className="card-head">
                <span className="label">Revenue (INR)</span>
                <TrendingUp size={18} style={{ color: '#0051d5' }} />
              </div>
              <div className="value">₹{totalRevenue.toLocaleString()}</div>
              <div className="trend up">
                <Zap size={14} /> Based on {range} days
              </div>
            </div>
            <div className="kpi-card">
              <div className="card-head">
                <span className="label">Success Rate</span>
                <CheckCircle size={18} style={{ color: '#059669' }} />
              </div>
              <div className="value">{data.successRate}%</div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px' }}>
                <div style={{ width: `${data.successRate}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="card-head">
                <span className="label">Avg Delivery SLA</span>
                <Clock size={18} style={{ color: '#0051d5' }} />
              </div>
              <div className="value">{data.avgDeliveryDays} Days</div>
              <div className="trend neutral">Promised vs Actual</div>
            </div>
            <div className="kpi-card">
              <div className="card-head">
                <span className="label">Cancellation Rate</span>
                <AlertCircle size={18} style={{ color: data.cancellationRate > 10 ? '#dc2626' : '#64748b' }} />
              </div>
              <div className="value">{data.cancellationRate}%</div>
              <div className="trend" style={{ color: data.cancellationRate < 10 ? '#059669' : '#dc2626' }}>
                {data.cancellationRate < 10 ? 'HEALTHY' : 'REQUIRES ATTENTION'}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="visuals-row">
        <div className="visual-card">
          <div className="card-title-bar">
            <h3>Revenue Trend Line</h3>
            <MoreHorizontal size={18} style={{ color: '#94a3b8', cursor: 'pointer' }} />
          </div>
          <div className="visual-body">
            {loading ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <RefreshCcw size={32} className="animate-spin" />
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={data.revenueTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0051d5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0051d5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={700}
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={700}
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `₹${val/1000}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#0051d5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} dot={{ r: 4, fill: 'white', strokeWidth: 2, stroke: '#0051d5' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="visual-card">
          <div className="card-title-bar">
            <h3>Hub Load Matrix</h3>
          </div>
          <div className="visual-body">
            {loading ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <RefreshCcw size={24} className="animate-spin" />
              </div>
            ) : (
              <div className="hub-load-list">
                {data.hubPerformance.map((hub, i) => (
                  <div key={i} className="hub-load-item">
                    <div className="hub-info">
                      <span className="name">{hub.hubName}</span>
                      <span className="type">Logistics Cluster</span>
                    </div>
                    <div className="hub-status">
                      <span className={`status-text ${hub.status.toLowerCase()}`}>{hub.status}</span>
                      <span className="units-count">{hub.volume} Units</span>
                    </div>
                  </div>
                ))}
                <button className="btn-simulate" style={{ width: '100%', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
                  View Hub Analytics
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="card-title-bar">
          <div>
            <h3>Top Route Performance (Pincode Heatmap)</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>Aggregated shipping volume and revenue by transit lanes</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-reports-table">
            <thead>
              <tr>
                <th>From (Pincode)</th>
                <th>To (Pincode)</th>
                <th>Volume (Bookings)</th>
                <th>Net Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading Heatmap...</td></tr>
              ) : (
                data.topRoutes.map((route, i) => (
                  <tr key={i}>
                    <td>
                      <div className="route-info">
                        <div className="route-icon"><Circle size={16} /></div>
                        <span className="pincode-text">{route.fromPincode}</span>
                      </div>
                    </td>
                    <td>
                      <div className="route-info">
                        <div className="route-icon"><MapPin size={16} /></div>
                        <span className="pincode-text">{route.toPincode}</span>
                      </div>
                    </td>
                    <td><span className="volume-text">{route.count.toLocaleString()}</span></td>
                    <td><span className="revenue-text">₹{route.revenue.toLocaleString()}</span></td>
                    <td><span className="velocity-badge">High Velocity</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="strategic-grid">
        <div className="bento-light" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ opacity: 0.1, position: 'absolute', inset: 0 }}>
             <Package size={100} style={{ transform: 'translate(-20%, -20%) rotate(-15deg)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="label" style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>NETWORK HEALTH</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0' }}>{data?.successRate || 98.4}% Optimal</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Current cluster efficiency operating above system threshold SLA.</p>
          </div>
        </div>

        <div className="bento-dark">
          <Bolt className="bolt-icon" />
          <div className="bento-insight">
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6' }}>INTELLIGENCE INSIGHT</span>
            <h4>Route Optimization Opportunity</h4>
            <p>Machine learning analysis suggests consolidating transit lanes could save ₹2.4M monthly across regional hubs.</p>
          </div>
          <button className="btn-simulate">
            Run Simulation <ChevronRight size={16} />
          </button>
        </div>

        <div className="bento-light">
          <span className="label" style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>MARKET SHARE</span>
          <div className="share-bars">
             <div className="bar" style={{ height: '40%' }}></div>
             <div className="bar" style={{ height: '65%' }}></div>
             <div className="bar active" style={{ height: '85%' }}></div>
             <div className="bar" style={{ height: '30%' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} style={{ color: '#0051d5' }} />
            <span style={{ fontWeight: 800, fontSize: '14px' }}>Market Leader (32%)</span>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid #e2e8f0' }}>
         <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>© 2024 SmartCourier Enterprise Logistics Hub. All proprietary data protected by 256-bit AES encryption.</p>
      </footer>
    </div>
  );
}
