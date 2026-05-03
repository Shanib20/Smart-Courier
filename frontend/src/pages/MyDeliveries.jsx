import { useEffect, useState, useMemo } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { 
  Search, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Download,
  Plus,
  AlertTriangle,
  Box,
  Truck,
  Info,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import usePageTitle from '../hooks/usePageTitle';
import Pagination from '../components/Pagination';
import './MyDeliveries.css';

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageTitle('My Deliveries');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await deliveryApi.getMyDeliveries(pageNum, 10);
      setDeliveries(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      addToast('Failed to fetch shipments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesSearch = (d.trackingNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (d.receiverName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const isActive = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status);
      
      if (activeFilter === 'ALL') return matchesSearch;
      if (activeFilter === 'ACTIVE') return matchesSearch && isActive;
      return matchesSearch && d.status === activeFilter;
    });
  }, [deliveries, searchTerm, activeFilter]);

  // Calculate Stats
  const stats = useMemo(() => {
    return {
      inTransit: deliveries.filter(d => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length,
      delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
      delayed: deliveries.filter(d => d.status === 'DELAYED').length, // Support for future delayed status
      atHub: deliveries.filter(d => ['BOOKED', 'PICKED_UP'].includes(d.status)).length
    };
  }, [deliveries]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [deliveryToCancel, setDeliveryToCancel] = useState(null);

  const openCancelModal = (e, delivery) => {
    e.stopPropagation();
    setDeliveryToCancel(delivery);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!deliveryToCancel) return;
    try {
      // Use the specific cancel endpoint defined in deliveryApi
      await deliveryApi.cancelDelivery(deliveryToCancel.id);
      addToast('Shipment cancelled successfully', 'success');
      setShowCancelModal(false);
      fetchDeliveries();
    } catch (err) {
      addToast('Failed to cancel shipment', 'error');
    }
  };

  const handleExportCSV = () => {
    if (filteredDeliveries.length === 0) {
      addToast('No shipments to export', 'info');
      return;
    }

    // CSV Headers
    const headers = ['Tracking ID', 'Date Created', 'Recipient Name', 'Destination', 'Status'];
    
    // CSV Rows
    const csvRows = filteredDeliveries.map(d => [
      d.trackingNumber || '',
      formatDate(d.createdAt) || '',
      `"${d.receiverName || ''}"`, // Wrap in quotes in case of commas
      `"${d.deliveryAddress?.city || ''}, ${d.deliveryAddress?.country || ''}"`,
      d.status || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartcourier_deliveries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('CSV exported successfully', 'success');
  };

  const canCancel = (createdAt) => {
    const hourInMs = 60 * 60 * 1000;
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    return (now - created) < hourInMs;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="my-deliveries-container slide-up">
      {/* Header */}
      <div className="page-header-section">
        <div className="header-left">
          <h1>My Deliveries</h1>
          <p>Manage and monitor your active logistics pipeline.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <Link to="/deliveries/new" className="btn-primary" style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Plus size={16} /> Create Delivery
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-grid">
        <div className="stat-card transit">
          <div className="stat-icon-box"><Truck size={20} /></div>
          <div className="stat-info">
            <p className="stat-label">In Transit</p>
            <p className="stat-value">{stats.inTransit}</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon-box"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <p className="stat-label">Delivered</p>
            <p className="stat-value">{stats.delivered}</p>
          </div>
        </div>
        <div className="stat-card delayed">
          <div className="stat-icon-box"><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <p className="stat-label">Delayed</p>
            <p className="stat-value">{stats.delayed}</p>
          </div>
        </div>
        <div className="stat-card hub">
          <div className="stat-icon-box"><Box size={20} /></div>
          <div className="stat-info">
            <p className="stat-label">At Hub</p>
            <p className="stat-value">{stats.atHub}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by Tracking ID or Recipient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          {STATUS_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select className="filter-select">
          <option>Last 30 Days</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="deliveries-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Date Created</th>
                <th>Recipient Name</th>
                <th>Destination</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>Loading shipments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <Package size={48} style={{ color: '#cbd5e1' }} />
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>No shipments found</h3>
                      <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span className="tracking-id" onClick={() => navigate(`/deliveries/${d.id}`)}>
                        #{d.trackingNumber}
                      </span>
                    </td>
                    <td>{formatDate(d.createdAt)}</td>
                    <td>
                      <span className="recipient-name">{d.receiverName}</span>
                    </td>
                    <td>
                      <span className="destination-text">{d.deliveryAddress.city}, {d.deliveryAddress.country}</span>
                    </td>
                    <td>
                      <div className={`status-pill ${d.status.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {d.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="action-cell">
                      {d.status === 'BOOKED' && canCancel(d.createdAt) && (
                        <button className="btn-cancel-action" onClick={(e) => openCancelModal(e, d)}>
                          Cancel
                        </button>
                      )}
                      <button className="btn-view-details" onClick={() => navigate(`/deliveries/${d.id}`)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={fetchDeliveries}
        />
      </div>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="cancel-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowCancelModal(false)}>
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <div className="cancel-modal-header">
              <div className="warning-icon-bg">
                <AlertTriangle size={24} />
              </div>
              <h3>Cancel Shipment?</h3>
              <p>Are you sure you want to cancel shipment <strong>#{deliveryToCancel?.trackingNumber}</strong>? This action cannot be undone.</p>
            </div>
            <div className="cancel-modal-footer">
              <button className="btn-secondary-outline" onClick={() => setShowCancelModal(false)}>Keep Shipment</button>
              <button className="btn-danger-confirm" onClick={confirmCancellation}>Yes, Cancel Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Bar */}
      <div className="cancellation-policy-bar">
        <Info size={16} />
        <span>Cancellations are only permitted within <strong>1 hour</strong> of booking.</span>
      </div>
    </div>
  );
}
