import { useEffect, useState, useMemo } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { 
  Search, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import './MyDeliveries.css';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryApi.getMyDeliveries(0, 100);
      setDeliveries(response.content || []);
    } catch (err) {
      addToast('Failed to fetch shipments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesSearch = d.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isActive = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status);
      
      if (activeFilter === 'ALL') return matchesSearch;
      if (activeFilter === 'ACTIVE') return matchesSearch && isActive;
      return matchesSearch && d.status === activeFilter;
    });
  }, [deliveries, searchTerm, activeFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel?')) return;
    try {
      await deliveryApi.updateDeliveryStatus(id, 'CANCELLED');
      addToast('Cancelled', 'success');
      fetchDeliveries();
    } catch (err) {
      addToast('Error', 'error');
    }
  };

  const canCancel = (createdAt) => {
    const hourInMs = 60 * 60 * 1000;
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    return (now - created) < hourInMs;
  };

  return (
    <div className="my-deliveries-container slide-up">
      <div className="page-header">
        <h1>My Shipments</h1>
        <Link to="/deliveries/new" className="btn btn-primary">Book New</Link>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tracking ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tabs">
          {STATUS_FILTERS.map(f => (
            <button 
              key={f.value}
              className={`tab-btn ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="policy-info-bar">
        <Clock size={14} />
        <span>Cancellations are only permitted within <strong>1 hour</strong> of booking.</span>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton-row"></div>)}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h3>No shipments found</h3>
          <Link to="/deliveries/new" className="btn btn-outline">Start Booking</Link>
        </div>
      ) : (
        <div className="deliveries-list row-view">
          {filteredDeliveries.map(d => (
            <div key={d.id} className="delivery-row" onClick={() => navigate(`/deliveries/${d.id}`)}>
              <div className="row-main">
                <div className="row-id">
                  <span className="id-text">{d.trackingNumber}</span>
                </div>
                <div className="row-route">
                  <span className="city">{d.pickupAddress.city}</span>
                  <ArrowRight size={14} className="route-arrow" />
                  <span className="city">{d.deliveryAddress.city}</span>
                </div>
              </div>
              
              <div className="row-side">
                <div className={`status-badge-small ${d.status.toLowerCase()}`}>
                  {d.status.replace('_', ' ')}
                </div>
                {d.status === 'BOOKED' && canCancel(d.createdAt) && (
                  <button className="cancel-btn-small" onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }}>
                    Cancel
                  </button>
                )}
                <ChevronRight size={18} className="chevron" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
