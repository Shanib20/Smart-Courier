import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Download,
  RefreshCcw
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
import { useToast } from '../hooks/useToast';
import './Reports.css';

const SkeletonCard = () => (
  <div className="metric-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-value"></div>
    <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: '1rem' }}></div>
  </div>
);

export default function Reports() {
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
      
      // Section 1: Summary Stats
      csvContent += "SUMMARY METRICS\n";
      csvContent += `Success Rate,${data.successRate}%\n`;
      csvContent += `Avg Delivery SLA,${data.avgDeliveryDays} Days\n`;
      csvContent += `Cancellation Rate,${data.cancellationRate}%\n\n`;
      
      // Section 2: Revenue Trend
      csvContent += "REVENUE TREND\nDate,Amount\n";
      data.revenueTrend.forEach(row => {
        csvContent += `${row.date},${row.amount}\n`;
      });
      csvContent += "\n";
      
      // Section 3: Top Routes
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
        <div className="error-card">
          <AlertCircle size={48} color="#f43f5e" />
          <h2>Analytics Engine Offline</h2>
          <p>We couldn't aggregate the latest delivery metrics.</p>
          <button className="btn-retry" onClick={fetchAnalytics}>
            <RefreshCcw size={18} style={{marginRight: '0.5rem'}} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container slide-up">
      <div className="analytics-header">
        <div>
          <h1>System Intelligence</h1>
          <p className="subtitle">Real-time performance and financial analytics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="range-selector">
            <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last Quarter</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={exportCSV}>
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      <div className="metrics-row">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <div className="metric-card">
              <span className="label">Revenue (INR)</span>
              <div className="value">₹{data.revenueTrend.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
              <span className="sub-value success"><TrendingUp size={12}/> Based on {range} days</span>
            </div>
            <div className="metric-card success">
              <span className="label">Success Rate</span>
              <div className="value">{data.successRate}%</div>
              <span className="sub-value">Total Bookings: {data.stats.TOTAL || 0}</span>
            </div>
            <div className="metric-card">
              <span className="label">Avg Delivery SLA</span>
              <div className="value">{data.avgDeliveryDays} Days</div>
              <span className="sub-value"><Clock size={12}/> Promised vs Actual</span>
            </div>
            <div className="metric-card warning">
              <span className="label">Cancellation Rate</span>
              <div className="value">{data.cancellationRate}%</div>
              <span className="sub-value">Requires Attention if {'>'}10%</span>
            </div>
          </>
        )}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Revenue Trend Line</h3>
          {loading ? (
            <div className="skeleton skeleton-chart"></div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={data.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--accent)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Hub Load Matrix</h3>
          {loading ? (
            <div className="skeleton" style={{ height: '300px' }}></div>
          ) : (
            <div className="hub-mini-list">
              {data.hubPerformance.map((hub, i) => (
                <div key={i} className="hub-metric-item" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{hub.hubName}</span>
                    <span className={`status-badge ${hub.status === 'Healthy' ? 'active' : 'inactive'}`} style={{fontSize: '10px'}}>
                      {hub.status}
                    </span>
                  </div>
                  <div className="capacity-bar-bg" style={{ height: '6px' }}>
                    <div className="capacity-bar-fill safe" style={{ width: `${(hub.volume / 600) * 100}%`, height: '100%' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Volume: {hub.volume} units
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chart-card full-width">
        <h3>Top Route Performance (Pincode Heatmap)</h3>
        {loading ? (
          <div className="skeleton" style={{ height: '200px' }}></div>
        ) : (
          <table className="data-table">
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
              {data.topRoutes.map((route, i) => (
                <tr key={i}>
                  <td><span className="pincode-badge">{route.fromPincode}</span></td>
                  <td><span className="pincode-badge">{route.toPincode}</span></td>
                  <td><strong>{route.count}</strong></td>
                  <td>₹{route.revenue.toLocaleString()}</td>
                  <td><span className="badge positive">High Velocity</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
