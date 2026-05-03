import { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import { Edit2, Eye, Search, Truck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeliveryDetailModal from '../components/DeliveryDetailModal';
import EditDeliveryModal from '../components/EditDeliveryModal';
import StatusUpdateModal from '../components/StatusUpdateModal';
import './AdminDeliveries.css';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Modal States
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
      if (isNew && pageNum === 0) setLoading(true);
      const data = await deliveryApi.getAllDeliveries(pageNum, 10, query);
      const list = data.content || [];
      if (isNew) {
        setDeliveries(list);
      } else {
        setDeliveries(prev => [...prev, ...list]);
      }
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error fetching deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchAll(page + 1, false, searchTerm);
  };

  const handleStatusChangeAttempt = (delivery, nextStatus) => {
    setSelectedDelivery(delivery);
    setPendingStatus(nextStatus);
    setShowStatusUpdate(true);
  };

  const confirmStatusUpdate = async (id, statusData) => {
    try {
      await deliveryApi.updateDeliveryStatus(id, statusData);
      addToast(`Status updated to ${statusData.status}`, 'success');
      fetchAll(); // Refresh list
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
      throw err;
    }
  };

  const handleSaveEdit = async (id, payload) => {
    try {
      await deliveryApi.updateDelivery(id, payload);
      addToast('Delivery updated successfully', 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
      throw err;
    }
  };



  return (
    <div className="admin-deliveries">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div>
          <h1>Global Delivery Management</h1>
          <p className="subtitle">Monitor and update all system deliveries.</p>
        </div>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tracking or name..." 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading && page === 0 ? (
          <div className="loading-state"><Loader2 className="spinner" /> Loading deliveries...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">No deliveries found matching your search.</td>
                  </tr>
                ) : (
                  deliveries.map(d => (
                    <tr key={d.id}>
                      <td className="tracking-col">{d.trackingNumber}</td>
                      <td>{d.senderName}</td>
                      <td>{d.receiverName}</td>
                      <td>{d.serviceType}</td>
                      <td>
                        <select 
                          className={`status-select ${d.status.toLowerCase()}`}
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
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="View Details"
                            onClick={() => { setSelectedDelivery(d); setShowDetail(true); }}
                          >
                            <Eye size={18} />
                          </button>

                          <button 
                            className="btn-icon" 
                            title="Edit"
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
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
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
  );
}
