import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Power, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  Filter,
  Network,
  Wrench,
  Gauge,
  TrendingUp,
  Map,
  ArrowRight,
  Edit2,
  Globe,
  Loader2
} from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import usePageTitle from '../hooks/usePageTitle';
import Pagination from '../components/Pagination';
import { useToast } from '../hooks/useToast';
import AddHubModal from '../components/AddHubModal';
import './HubsManagement.css';

export default function HubsManagement() {
  const { addToast } = useToast();
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  usePageTitle('Hub Management');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const fetchHubs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryApi.getAllHubs(page, 10, searchQuery);
      setHubs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      addToast('Failed to load hubs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, addToast]);

  useEffect(() => {
    fetchHubs();
  }, [fetchHubs]);

  const handleToggleStatus = async (id) => {
    const previousHubs = [...hubs];
    setHubs(prev => prev.map(h => h.id === id ? { ...h, status: h.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : h));

    try {
      await deliveryApi.toggleHubStatus(id);
      addToast('Hub status updated', 'success');
    } catch (err) {
      setHubs(previousHubs);
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hub? This will only work if the hub is INACTIVE.')) return;
    try {
      await deliveryApi.deleteHub(id);
      addToast('Hub deleted successfully', 'success');
      fetchHubs();
    } catch (err) {
      addToast(err.response?.data || 'Ensure it is INACTIVE before deleting.', 'error');
    }
  };

  const handleEdit = (hub) => {
    setEditingHub(hub);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHub(null);
  };

  return (
    <div className="hubs-management-container slide-up">
      <div className="page-header-premium">
        <div>
          <h1>Hub Management</h1>
          <p className="subtitle">Configure and monitor global logistics nodes and distribution centers.</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium secondary">
            <Filter size={16} /> Filter
          </button>
          <button className="btn-premium primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add New Hub
          </button>
        </div>
      </div>

      <div className="stats-bento-grid">
        <div className="stat-bento-card">
          <div className="card-head">
            <span className="label">Total Active Hubs</span>
            <Network size={18} style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="value">{totalElements}</p>
            <p className="sub-label" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> 12% increase
            </p>
          </div>
        </div>
        <div className="stat-bento-card">
          <div className="card-head">
            <span className="label">Under Maintenance</span>
            <Wrench size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p className="value">03</p>
            <p className="sub-label" style={{ color: '#64748b' }}>Scheduled completion: 48h</p>
          </div>
        </div>
        <div className="stat-bento-card">
          <div className="card-head">
            <span className="label">Avg Throughput</span>
            <Gauge size={18} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p className="value">12.4k</p>
            <p className="sub-label" style={{ color: '#64748b' }}>Parcels / hour</p>
          </div>
        </div>
        <div className="stat-bento-card" style={{ background: '#f8fafc' }}>
          <div className="card-head">
            <span className="label">Network Uptime</span>
            <Activity size={18} style={{ color: '#0051d5' }} />
          </div>
          <div>
            <p className="value">99.9%</p>
            <p className="sub-label" style={{ color: '#059669' }}>Fully Operational</p>
          </div>
        </div>
      </div>

      <div className="hubs-control-bar">
        <div className="premium-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Hub Name, Code, or City..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            <option>Mega</option>
            <option>Standard</option>
            <option>Regional</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="hubs-table-premium">
          <thead>
            <tr>
              <th>Hub Code</th>
              <th>Hub Name</th>
              <th>Type</th>
              <th>Location</th>
              <th style={{ textAlign: 'center' }}>Pincode</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#0051d5' }} />
                </td>
              </tr>
            ) : hubs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No logistics nodes found matching your query.
                </td>
              </tr>
            ) : (
              hubs.map(hub => (
                <tr key={hub.id}>
                  <td className="hub-code-text">{hub.hubCode}</td>
                  <td className="hub-name-text">{hub.name}</td>
                  <td>
                    <span className={`hub-type-tag ${hub.hubType.toLowerCase()}`}>
                      {hub.hubType}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{hub.city}, {hub.state}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>{hub.pincode}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-pill-premium ${hub.status.toLowerCase()}`}>
                      <span className={`dot ${hub.status.toLowerCase()}`}></span>
                      {hub.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-premium">
                      <button className="icon-btn-premium" title="Edit Hub" onClick={() => handleEdit(hub)}>
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="icon-btn-premium toggle" 
                        onClick={() => handleToggleStatus(hub.id)}
                        title={hub.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        <Power size={14} />
                      </button>
                      <button 
                        className="icon-btn-premium delete"
                        onClick={() => handleDelete(hub.id)}
                        title="Delete Hub"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      <div className="operational-grid">
        <div className="bento-map-card">
          <div className="content">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Network Map Preview</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', lineHeight: 1.6 }}>
              Real-time visualization of inter-hub traffic. Zoom into specific regions to monitor local distribution efficiencies.
            </p>
            <button className="btn-simulate" style={{ color: '#0051d5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', marginTop: '16px' }}>
              View Full Global Map <ArrowRight size={14} />
            </button>
          </div>
          <div className="map-bg">
            <Map size={180} color="#0051d5" />
          </div>
        </div>
        <div className="bento-alert-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="urgent-tag">Urgent Alert</span>
            <h4 style={{ fontSize: '18px', fontWeight: 700 }}>Maintenance Window</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Hub-SIN-005 scheduled for structural system upgrade in 4 hours. Rerouting protocols initialized.
            </p>
          </div>
          <div className="team-avatars">
            <div className="avatar-stack">
              <img src="https://i.pravatar.cc/100?u=1" alt="Team" />
              <img src="https://i.pravatar.cc/100?u=2" alt="Team" />
              <img src="https://i.pravatar.cc/100?u=3" alt="Team" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>+3 team members notified</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddHubModal 
          hub={editingHub}
          onClose={handleCloseModal} 
          onSuccess={() => {
            handleCloseModal();
            fetchHubs();
          }}
        />
      )}
    </div>
  );
}
