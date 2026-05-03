import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';

export default function AddHubModal({ onClose, onSuccess, hub = null }) {
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

  useEffect(() => {
    if (hub) {
      setFormData({
        name: hub.name || '',
        pincode: hub.pincode || '',
        city: hub.city || '',
        state: hub.state || '',
        address: hub.address || '',
        hubType: hub.hubType || 'STANDARD'
      });
    }
  }, [hub]);

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
      if (hub) {
        await deliveryApi.updateHub(hub.id, formData);
        addToast('Hub synchronized successfully', 'success');
      } else {
        await deliveryApi.createHub(formData);
        addToast('New logistics node established', 'success');
      }
      onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process hub request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-premium" style={{ maxWidth: '600px' }}>
        <div className="modal-header-premium">
          <h2>{hub ? 'Edit Logistics Hub' : 'Establish New Hub'}</h2>
          <button className="icon-btn-premium" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body-premium">
            {hub && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hub Identity</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0051d5' }}>{hub.hubCode}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="input-label-premium">Hub Name</label>
              <input 
                required 
                type="text" 
                className="modal-select-premium"
                placeholder="e.g. Mumbai North Sorting Center"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="input-label-premium">Pincode</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    required 
                    type="text" 
                    className="modal-select-premium"
                    maxLength={6}
                    placeholder="6 digit pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                    onBlur={handlePincodeBlur}
                  />
                  {fetchingPincode && <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '14px', color: '#0051d5' }} />}
                </div>
              </div>
              <div className="form-group">
                <label className="input-label-premium">Hub Type</label>
                <select 
                  className="modal-select-premium"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '12px', marginBottom: '16px', background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                <AlertCircle size={16} />
                <span>Could not fetch location. Please enter manually.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="input-label-premium">City</label>
                <input 
                  required 
                  type="text" 
                  className="modal-select-premium"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={fetchingPincode && !pincodeError}
                />
              </div>
              <div className="form-group">
                <label className="input-label-premium">State</label>
                <input 
                  required 
                  type="text" 
                  className="modal-select-premium"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  disabled={fetchingPincode && !pincodeError}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label-premium">Physical Address</label>
              <textarea 
                required 
                className="modal-textarea-premium"
                style={{ height: '100px', resize: 'none' }}
                placeholder="Full address of the hub..."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-footer-premium">
            <button type="button" className="btn-premium-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-premium-solid" disabled={loading}>
              {loading ? 'Processing...' : hub ? 'Update Record' : 'Establish Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
