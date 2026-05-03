import { X, Send, MapPin, AlignLeft, Loader2, Building2, Package, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import './Modal.css';

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
      if (cachedHubs && (now - lastFetchTime < 300000)) {
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
    let finalDescription = description;
    if (selectedHub) {
      const hub = hubs.find(h => h.hubCode === selectedHub);
      if (hub) finalDescription = `[${hub.hubCode}] - ${description}`;
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
      <div className="modal-content-premium">
        <div className="modal-header-premium">
          <h2>Update Shipment Status</h2>
          <button onClick={onClose} className="btn-icon" style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-premium">
            
            <div className="shipment-info-bar">
              <Package size={18} style={{ color: '#64748b' }} />
              <div>
                Updating <strong>{delivery.trackingNumber}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="input-label-premium">
                  <Info size={14} /> Status
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="modal-select-premium"
                  required
                >
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label-premium">
                  <Building2 size={14} /> Location (Hub)
                </label>
                <select 
                  value={selectedHub} 
                  onChange={(e) => setSelectedHub(e.target.value)}
                  disabled={fetchingHubs}
                  className="modal-select-premium"
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
              <label className="input-label-premium">
                <AlignLeft size={14} /> Update Message
              </label>
              <textarea 
                placeholder="e.g. Package arrived at hub and is being processed."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="modal-textarea-premium"
                required
                rows={4}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                This message will be visible to the customer in their tracking timeline.
              </p>
            </div>
          </div>

          <div className="modal-footer-premium">
            <button type="button" onClick={onClose} className="btn-premium-ghost">Cancel</button>
            <button type="submit" className="btn-premium-solid" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={18} /> : <><Send size={16} /> Update & Notify</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
