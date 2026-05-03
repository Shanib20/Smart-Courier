import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deliveryApi } from '../api/deliveryApi';
import { trackingApi } from '../api/trackingApi';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Box, MapPin, Calendar, DollarSign, User, Mail, Clock } from 'lucide-react';
import './DeliveryDetail.css';

export default function DeliveryDetail() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await deliveryApi.getDeliveryById(id);
        setDelivery(data);
        
        // Fetch events separately (Lazy Load)
        if (data?.trackingNumber) {
          fetchTracking(data.trackingNumber);
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Error fetching delivery details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, addToast]);

  const fetchTracking = async (trackingNum) => {
    setLoadingEvents(true);
    try {
      const data = await trackingApi.getTrackingEvents(trackingNum);
      setEvents(data || []);
    } catch (err) {
      console.error("Timeline load failed", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (loading) return <div className="loading-state">Loading details...</div>;
  if (!delivery) return <div className="error-state">Delivery not found.</div>;

  const handleSendReceipt = async () => {
    setSendingReceipt(true);
    try {
      await deliveryApi.sendReceipt(id);
      addToast('Receipt emailed successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send receipt', 'error');
    } finally {
      setSendingReceipt(false);
    }
  };

  return (
    <div className="detail-container">
      <Link to="/deliveries" className="back-link btn" style={{display: 'inline-flex', alignItems: 'center', marginBottom: '2rem'}}>
        <ArrowLeft size={16} style={{marginRight: '0.5rem'}} /> Back to All Deliveries
      </Link>

      <div className="detail-header">
        <div>
          <h1>Delivery #{delivery.trackingNumber}</h1>
          <p className="subtitle">Reference ID: {delivery.id}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={handleSendReceipt} 
            disabled={sendingReceipt}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Mail size={16} />
            {sendingReceipt ? 'Sending...' : 'Send Email Receipt'}
          </button>
          <div className={`status-badge ${delivery.status.toLowerCase()}`}>
            {delivery.status}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card main-info">
          <h3><User size={18} /> Contact Information</h3>
          <div className="info-group">
            <div className="info-block">
              <span className="label">Sender</span>
              <p><strong>{delivery.senderName}</strong></p>
              <p>{delivery.senderPhone}</p>
            </div>
            <div className="info-block">
              <span className="label">Receiver</span>
              <p><strong>{delivery.receiverName}</strong></p>
              <p>{delivery.receiverPhone}</p>
            </div>
          </div>
        </div>

        <div className="detail-card package-info">
          <h3><Box size={18} /> Package Details</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Service Type</span>
              <span>{delivery.serviceType}</span>
            </div>
            <div className="info-item">
              <span className="label">Package Type</span>
              <span>{delivery.packageDetails?.packageType || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="label">Weight</span>
              <span>{delivery.packageDetails?.weightKg || 0} kg</span>
            </div>
            <div className="info-item">
              <span className="label">Dimensions</span>
              <span>{delivery.packageDetails?.dimensions || 'N/A'} cm</span>
            </div>
          </div>
        </div>

        <div className="detail-card addresses">
          <h3><MapPin size={18} /> Locations</h3>
          <div className="address-block origin">
            <span className="label">Origin Address</span>
            <p>{delivery.pickupAddress?.street}, {delivery.pickupAddress?.city}, {delivery.pickupAddress?.state} {delivery.pickupAddress?.pincode}, {delivery.pickupAddress?.country}</p>
          </div>
          <div className="address-block destination">
            <span className="label">Destination Address</span>
            <p>{delivery.deliveryAddress?.street}, {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.state} {delivery.deliveryAddress?.pincode}, {delivery.deliveryAddress?.country}</p>
          </div>
        </div>
        <div className="detail-card schedule">
          <h3><Calendar size={18} /> Schedule & Cost</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Created On</span>
              <span>{new Date(delivery.createdAt || delivery.createTime).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </div>
            <div className="info-item">
              <span className="label">Scheduled Pickup</span>
              <span>{new Date(delivery.scheduledPickupTime).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </div>
            <div className="info-item">
              <span className="label">Estimated Delivery</span>
              <span>{delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'TBD'}</span>
            </div>
            <div className="info-item total-cost">
              <span className="label">Total Cost</span>
              <span className="cost-value">₹ {delivery.chargeAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
        <div className="detail-card timeline-card" style={{ gridColumn: '1 / -1' }}>
          <h3><Clock size={18} /> Tracking Timeline</h3>
          {loadingEvents ? (
            <div className="notif-loading">Loading timeline...</div>
          ) : events.length === 0 ? (
            <p className="empty-state">No tracking events recorded yet.</p>
          ) : (
            <div className="detail-timeline">
              {events.map((event, idx) => (
                <div key={idx} className="timeline-event">
                  <div className="event-marker" />
                  <div className="event-info">
                    <div className="event-header">
                      <span className="event-status">{event.status.replace(/_/g, ' ')}</span>
                      <span className="event-time">{new Date(event.eventTime).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                    </div>
                    <p className="event-desc">{event.description} at <strong>{event.location}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
