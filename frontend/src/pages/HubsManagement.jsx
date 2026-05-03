import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MapPin, Trash2, Power, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import AddHubModal from '../components/AddHubModal';
import './HubsManagement.css';

export default function HubsManagement() {
  const { addToast } = useToast();
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Frontend filter for the current page
  const filteredHubs = hubs.filter(hub => 
    hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.pincode.includes(searchQuery) ||
    hub.hubCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchHubs = async () => {
    setLoading(true);
    try {
      const data = await deliveryApi.getAllHubs(page, 10, searchQuery);
      setHubs(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      addToast('Failed to load hubs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, [page, searchQuery]);

  const handleToggleStatus = async (id) => {
    // Optimistic UI update
    const previousHubs = [...hubs];
    setHubs(prev => prev.map(h => h.id === id ? { ...h, status: h.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : h));

    try {
      await deliveryApi.toggleHubStatus(id);
      addToast('Status updated successfully', 'success');
    } catch (err) {
      setHubs(previousHubs); // Revert on failure
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
      addToast(err.response?.data || 'Failed to delete hub. Ensure it is INACTIVE first.', 'error');
    }
  };

  return (
    <div className="hubs-management-container slide-up">
      <div className="page-header">
        <div>
          <h1>Hub Management</h1>
          <p className="subtitle">Configure routing nodes and logistics hubs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Hub
        </button>
      </div>

      <div className="hubs-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by city, pincode, or code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="hubs-table">
          <thead>
            <tr>
              <th>Hub Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Pincode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="empty-state">Loading hubs...</td></tr>
            ) : filteredHubs.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No hubs found.</td></tr>
            ) : (
              filteredHubs.map(hub => (
                <tr key={hub.id}>
                  <td className="hub-code-cell">{hub.hubCode}</td>
                  <td><strong>{hub.name}</strong></td>
                  <td>
                    <span className={`type-tag type-${hub.hubType.toLowerCase()}`}>
                      {hub.hubType}
                    </span>
                  </td>
                  <td>{hub.city}, {hub.state}</td>
                  <td className="mono">{hub.pincode}</td>
                  <td>
                    <span className={`status-badge ${hub.status.toLowerCase()}`}>
                      {hub.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className={`action-btn ${hub.status === 'ACTIVE' ? 'btn-active' : 'btn-inactive'}`}
                      onClick={() => handleToggleStatus(hub.id)}
                      title={hub.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      className="action-btn btn-delete"
                      onClick={() => handleDelete(hub.id)}
                      title="Delete Hub"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-icon" 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button 
            className="btn btn-icon" 
            disabled={page === totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddHubModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchHubs();
          }}
        />
      )}
    </div>
  );
}
