import { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';

export default function AddHubModal({ onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    pincode: '',
    city: '',
    state: '',
    address: '',
    hubType: 'STANDARD'
  });

  const handlePincodeBlur = async () => {
    if (formData.pincode.length !== 6) return;
    
    setFetchingPincode(true);
    setPincodeError(false);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
      const data = await response.json();
      
      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      } else {
        throw new Error('Invalid pincode');
      }
    } catch (err) {
      setPincodeError(true);
      addToast('Could not fetch city/state. Please enter manually.', 'warning');
    } finally {
      setFetchingPincode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deliveryApi.createHub(formData);
      addToast('Hub created successfully', 'success');
      onSuccess();
    } catch (err) {
      addToast(err.response?.data || 'Failed to create hub', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content hub-modal slide-up">
        <div className="modal-header">
          <h2>Add New Hub</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="hub-form">
          <div className="form-group">
            <label>Hub Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Mumbai North Sorting Center"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pincode</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required 
                  type="text" 
                  maxLength={6}
                  placeholder="6 digit pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                  onBlur={handlePincodeBlur}
                />
                {fetchingPincode && <Loader2 size={16} className="spin-loader" style={{ position: 'absolute', right: '10px', top: '12px' }} />}
              </div>
            </div>
            <div className="form-group">
              <label>Hub Type</label>
              <select 
                value={formData.hubType}
                onChange={(e) => setFormData({...formData, hubType: e.target.value})}
              >
                <option value="MINI">MINI</option>
                <option value="STANDARD">STANDARD</option>
                <option value="MEGA">MEGA</option>
              </select>
            </div>
          </div>

          {pincodeError && (
            <div className="inline-warning">
              <AlertCircle size={16} />
              <span>Could not fetch location. Please enter manually.</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input 
                required 
                type="text" 
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                disabled={fetchingPincode && !pincodeError}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input 
                required 
                type="text" 
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                disabled={fetchingPincode && !pincodeError}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Physical Address</label>
            <textarea 
              required 
              placeholder="Full address of the hub..."
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
