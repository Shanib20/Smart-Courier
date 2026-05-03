import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackingApi } from '../api/trackingApi';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import { MapPin, Send, ArrowLeft, Loader2, Package } from 'lucide-react';
import './UpdateTracking.css';

export default function UpdateTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    status: 'IN_TRANSIT',
    location: '',
    description: ''
  });

  const statuses = [
    'BOOKED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED_AT_HUB',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ];

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const data = await deliveryApi.getDeliveryById(id);
        setDelivery(data);
      } catch (err) {
        addToast('Failed to load delivery details', 'error');
        navigate('/admin/deliveries');
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [id, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) {
      addToast('Location is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await trackingApi.addTrackingEvent({
        trackingNumber: delivery.trackingNumber,
        status: formData.status,
        location: formData.location,
        description: formData.description,
        customerEmail: delivery.customerEmail
      });
      addToast('Tracking event added and user notified!', 'success');
      navigate(`/admin/deliveries`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update tracking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={48} className="spinner-icon" />
      </div>
    );
  }

  return (
    <div className="update-tracking-container">
      <button onClick={() => navigate(-1)} className="back-link">
        <ArrowLeft size={18} /> Back to Deliveries
      </button>

      <div className="page-header">
        <h1>Update Tracking Status</h1>
        <p>Adding an event will trigger an automated email to the customer.</p>
      </div>

      <div className="tracking-summary-card">
        <div className="package-info">
          <Package className="package-icon" />
          <div>
            <h3>{delivery.trackingNumber}</h3>
            <p>{delivery.senderName} → {delivery.receiverName}</p>
          </div>
        </div>
        <div className="current-status">
          <span className="label">Current Delivery Status</span>
          <span className={`status-pill status-${delivery.status.toLowerCase()}`}>
            {delivery.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="update-tracking-form card">
        <div className="form-group">
          <label>Update Status To</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Current Location</label>
          <div className="input-with-icon">
            <MapPin size={18} />
            <input 
              type="text" 
              placeholder="e.g. Mumbai Sorting Center"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Update Description (Optional)</label>
          <textarea 
            placeholder="e.g. Package has arrived at the local hub and is being processed."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <><Loader2 size={18} className="spinner-icon" /> Updating...</>
          ) : (
            <><Send size={18} /> Publish Update & Notify Customer</>
          )}
        </button>
      </form>
    </div>
  );
}
