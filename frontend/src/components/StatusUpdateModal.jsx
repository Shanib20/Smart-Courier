import { X, Send, MapPin, AlignLeft, Loader2, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import './Modal.css';

// Simple global cache outside the component to persist across re-mounts
let cachedHubs = null;
let lastFetchTime = 0;

export default function StatusUpdateModal({ delivery, nextStatus, onConfirm, onClose }) {
  const [status, setStatus] = useState(nextStatus);
  const [description, setDescription] = useState('');
  const [selectedHub, setSelectedHub] = useState('');
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHubs, setFetchingHubs] = useState(false);

  useEffect(() => {
    const getHubs = async () => {
      const now = Date.now();
      if (cachedHubs && (now - lastFetchTime < 300000)) { // 5 minutes cache
        setHubs(cachedHubs);
        return;
      }

      setFetchingHubs(true);
      try {
        const data = await deliveryApi.getActiveHubs();
        setHubs(data || []);
        cachedHubs = data;
        lastFetchTime = now;
      } catch (err) {
        console.error("Failed to load hubs", err);
      } finally {
        setFetchingHubs(false);
      }
    };
    getHubs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Append hub info to description if selected
    let finalDescription = description;
    if (selectedHub) {
      const hub = hubs.find(h => h.hubCode === selectedHub);
      if (hub) {
        finalDescription = `[${hub.hubCode}] - ${description}`;
      }
    }

    try {
      await onConfirm(delivery.id, {
        status,
        description: finalDescription,
        location: selectedHub ? hubs.find(h => h.hubCode === selectedHub)?.city : 'System'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small-modal">
        <div className="modal-header">
          <h2>Update Shipment Status</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-info">Updating <strong>{delivery.trackingNumber}</strong></p>
          
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="status-select-modal"
                required
              >
                <option value="PICKED_UP">PICKED UP</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Location (Hub)</label>
              <select 
                value={selectedHub} 
                onChange={(e) => setSelectedHub(e.target.value)}
                disabled={fetchingHubs}
              >
                <option value="">-- Manual/Other --</option>
                {hubs.map(hub => (
                  <option key={hub.id} value={hub.hubCode}>
                    {hub.hubCode} - {hub.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Update Message (Notification to Customer)</label>
            <textarea 
              placeholder="e.g. Package arrived at hub"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-textarea"
              required
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="spinner" /> : <><Send size={18} /> Update & Notify</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
