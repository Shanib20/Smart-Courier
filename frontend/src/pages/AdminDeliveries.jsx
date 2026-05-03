import { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import { Edit2, Eye, Search, Truck, Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeliveryDetailModal from '../components/DeliveryDetailModal';
import EditDeliveryModal from '../components/EditDeliveryModal';
import StatusUpdateModal from '../components/StatusUpdateModal';
import usePageTitle from '../hooks/usePageTitle';
import Pagination from '../components/Pagination';
import './AdminDeliveries.css';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageTitle('All Deliveries');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAll(0, true, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchAll = async (pageNum = 0, isNew = false, query = '') => {
    try {
      setLoading(true);
      const data = await deliveryApi.getAllDeliveries(pageNum, 10, query);
      setDeliveries(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error fetching deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => fetchAll(page + 1, false, searchTerm);

  const handleStatusChangeAttempt = (delivery, nextStatus) => {
    setSelectedDelivery(delivery);
    setPendingStatus(nextStatus);
    setShowStatusUpdate(true);
  };

  const confirmStatusUpdate = async (id, statusData) => {
    try {
      await deliveryApi.updateDeliveryStatus(id, statusData);
      addToast(`Status updated to ${statusData.status}`, 'success');
      fetchAll(0, true, searchTerm);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
      throw err;
    }
  };

  const handleSaveEdit = async (id, payload) => {
    try {
      await deliveryApi.updateDelivery(id, payload);
      addToast('Delivery updated successfully', 'success');
      fetchAll(0, true, searchTerm);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
      throw err;
    }
  };

  return (
    <div className="admin-deliveries-page">
      <div className="admin-deliveries-max-width">
        
        <div className="deliveries-header">
          <div>
            <h1>Global Deliveries</h1>
            <p className="subtitle">Real-time monitoring and lifecycle management.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn-premium-ghost" onClick={() => fetchAll(0, true, searchTerm)}>
               <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
               Refresh
             </button>
          </div>
        </div>

        <div className="deliveries-card">
          <div className="card-top-bar">
            <h3>Recent Shipments</h3>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tracking #, sender or receiver..." 
                className="admin-search-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && page === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}>
                      <Loader2 className="animate-spin" size={32} style={{ color: '#0051d5' }} />
                    </td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
                      No deliveries found matching your query.
                    </td>
                  </tr>
                ) : (
                  deliveries.map(d => (
                    <tr key={d.id}>
                      <td><span className="tracking-id">#{d.trackingNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.senderName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{d.senderPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.receiverName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{d.receiverPhone}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <Truck size={14} style={{ color: '#0051d5' }} />
                          {d.serviceType}
                        </div>
                      </td>
                      <td>
                        <select 
                          className={`status-pill-select ${d.status.toLowerCase()}`}
                          value={d.status}
                          onChange={(e) => handleStatusChangeAttempt(d, e.target.value)}
                        >
                          <option value="BOOKED">BOOKED</option>
                          <option value="PICKED_UP">PICKED UP</option>
                          <option value="IN_TRANSIT">IN TRANSIT</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="RETURNED">RETURNED</option>
                          <option value="CANCELLED" disabled>CANCELLED</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-icon-premium" 
                            title="View Lifecycle"
                            onClick={() => { setSelectedDelivery(d); setShowDetail(true); }}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="btn-icon-premium" 
                            title="Edit Record"
                            disabled={d.status === 'DELIVERED' || d.status === 'CANCELLED'}
                            onClick={() => { setSelectedDelivery(d); setShowEdit(true); }}
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
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
          onPageChange={(p) => fetchAll(p, true, searchTerm)}
        />
      </div>

        {showDetail && selectedDelivery && (
          <DeliveryDetailModal 
            delivery={selectedDelivery} 
            onClose={() => setShowDetail(false)} 
          />
        )}

        {showEdit && selectedDelivery && (
          <EditDeliveryModal 
            delivery={selectedDelivery} 
            onSave={handleSaveEdit}
            onClose={() => setShowEdit(false)} 
          />
        )}

        {showStatusUpdate && selectedDelivery && (
          <StatusUpdateModal 
            delivery={selectedDelivery}
            nextStatus={pendingStatus}
            onConfirm={confirmStatusUpdate}
            onClose={() => setShowStatusUpdate(false)}
          />
        )}
      </div>
    </div>
  );
}
