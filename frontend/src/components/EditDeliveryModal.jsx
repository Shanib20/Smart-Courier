import { X, Send, Save, Loader2 } from 'lucide-react';
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
      <div className="modal-content edit-modal">
        <div className="modal-header">
          <h2>Edit Delivery: {delivery.trackingNumber}</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Sender Phone</label>
              <input 
                type="text" 
                value={formData.senderPhone}
                onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Receiver Phone</label>
              <input 
                type="text" 
                value={formData.receiverPhone}
                onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Package Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.packageDetails.weightKg}
                onChange={(e) => setFormData({
                  ...formData, 
                  packageDetails: { ...formData.packageDetails, weightKg: parseFloat(e.target.value) }
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Dimensions (L x W x H)</label>
              <input 
                type="text" 
                value={formData.packageDetails.dimensions}
                onChange={(e) => setFormData({
                  ...formData, 
                  packageDetails: { ...formData.packageDetails, dimensions: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="spinner" /> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
