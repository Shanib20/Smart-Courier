import { X, Send, Save, Loader2, Phone, Package, Calendar, Maximize } from 'lucide-react';
import { useState } from 'react';
import './Modal.css';

export default function EditDeliveryModal({ delivery, onSave, onClose }) {
  const [formData, setFormData] = useState({
    senderPhone: delivery.senderPhone,
    receiverPhone: delivery.receiverPhone,
    packageDetails: { ...delivery.packageDetails },
    scheduledPickupTime: delivery.scheduledPickupTime
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(delivery.id, formData);
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
          <h2>Edit Delivery Details</h2>
          <button onClick={onClose} className="btn-icon" style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-premium">
            <div className="shipment-info-bar">
              <Package size={18} style={{ color: '#64748b' }} />
              <div>
                Editing <strong>{delivery.trackingNumber}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="input-label-premium">
                  <Phone size={14} /> Sender Phone
                </label>
                <input 
                  type="text" 
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
                  className="modal-select-premium"
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label-premium">
                  <Phone size={14} /> Receiver Phone
                </label>
                <input 
                  type="text" 
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                  className="modal-select-premium"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="input-label-premium">
                  <Package size={14} /> Weight (KG)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.packageDetails.weightKg}
                  onChange={(e) => setFormData({
                    ...formData, 
                    packageDetails: { ...formData.packageDetails, weightKg: parseFloat(e.target.value) }
                  })}
                  className="modal-select-premium"
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label-premium">
                  <Maximize size={14} /> Dimensions
                </label>
                <input 
                  type="text" 
                  placeholder="L x W x H"
                  value={formData.packageDetails.dimensions}
                  onChange={(e) => setFormData({
                    ...formData, 
                    packageDetails: { ...formData.packageDetails, dimensions: e.target.value }
                  })}
                  className="modal-select-premium"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label-premium">
                <Calendar size={14} /> Scheduled Pickup
              </label>
              <input 
                type="datetime-local" 
                value={formData.scheduledPickupTime ? formData.scheduledPickupTime.slice(0, 16) : ''}
                onChange={(e) => setFormData({...formData, scheduledPickupTime: e.target.value})}
                className="modal-select-premium"
              />
            </div>
          </div>

          <div className="modal-footer-premium">
            <button type="button" onClick={onClose} className="btn-premium-ghost">Cancel</button>
            <button type="submit" className="btn-premium-solid" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={18} /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
