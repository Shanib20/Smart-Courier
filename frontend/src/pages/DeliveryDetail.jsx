import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deliveryApi } from '../api/deliveryApi';
import { trackingApi } from '../api/trackingApi';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Box, MapPin, Mail, User, ArrowRight, ArrowDown } from 'lucide-react';
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
    <div className="detail-page-wrapper">
      <div className="detail-max-width">
        <Link to="/deliveries" className="btn-icon-outline" style={{ width: 'fit-content', border: 'none', background: 'transparent', padding: '0' }}>
          <ArrowLeft size={16} /> Back to All Deliveries
        </Link>

        {/* Page Header */}
        <div className="detail-page-header">
          <div className="header-title-group">
            <div className="title-row">
              <h2>#{delivery.trackingNumber}</h2>
              <span className={`status-badge-chip ${delivery.status.toLowerCase()}`}>
                {delivery.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="header-subtitle">
              Shipment initiated on {new Date(delivery.createdAt || delivery.createTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-icon-outline" 
              onClick={handleSendReceipt} 
              disabled={sendingReceipt}
            >
              <Mail size={18} />
              {sendingReceipt ? 'Sending...' : 'Send Email Receipt'}
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="detail-grid-layout">
          {/* Left Column (Span 2) */}
          <div className="detail-grid-left">
            <div className="dd-card">
              <div className="dd-card-header">
                <h3>Delivery Logistics Profile</h3>
              </div>
              <div className="dd-card-body profile-grid">
                
                {/* Contact Information */}
                <section className="profile-section">
                  <h4 className="section-title">
                    <User className="section-icon" /> Contact Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <p className="data-label">Sender</p>
                      <p className="data-value">{delivery.senderName}</p>
                      <p className="data-value-sm" style={{color: '#45464d', fontWeight: 400}}>{delivery.senderPhone}</p>
                    </div>
                    <div>
                      <p className="data-label">Receiver</p>
                      <p className="data-value">{delivery.receiverName}</p>
                      <p className="data-value-sm" style={{color: '#45464d', fontWeight: 400}}>{delivery.receiverPhone}</p>
                    </div>
                  </div>
                </section>

                {/* Package Details */}
                <section className="profile-section">
                  <h4 className="section-title">
                    <Box className="section-icon" /> Package Details
                  </h4>
                  <div className="package-grid">
                    <div className="data-block">
                      <p className="data-label">Service</p>
                      <p className="data-value-sm">{delivery.serviceType}</p>
                    </div>
                    <div className="data-block">
                      <p className="data-label">Type</p>
                      <p className="data-value-sm">{delivery.packageDetails?.packageType || 'Unknown'}</p>
                    </div>
                    <div className="data-block">
                      <p className="data-label">Weight</p>
                      <p className="data-value-sm">{delivery.packageDetails?.weightKg || 0} kg</p>
                    </div>
                    <div className="data-block">
                      <p className="data-label">Dimensions</p>
                      <p className="data-value-sm">{delivery.packageDetails?.dimensions || 'Standard cm'}</p>
                    </div>
                  </div>
                </section>

                {/* Location Routing */}
                <section className="profile-section full-width">
                  <h4 className="section-title">
                    <MapPin className="section-icon" /> Location Routing
                  </h4>
                  <div className="routing-container">
                    <div className="location-box">
                      <p className="data-label">Origin Address</p>
                      <p className="data-value-sm">{delivery.pickupAddress?.street || ''} {delivery.pickupAddress?.city}, {delivery.pickupAddress?.state} {delivery.pickupAddress?.pincode}, {delivery.pickupAddress?.country}</p>
                    </div>
                    <div className="route-arrow-container">
                      <ArrowRight className="route-arrow desktop" size={24} />
                      <ArrowDown className="route-arrow mobile" size={24} />
                    </div>
                    <div className="location-box">
                      <p className="data-label">Destination Address</p>
                      <p className="data-value-sm">{delivery.deliveryAddress?.street || ''} {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.state} {delivery.deliveryAddress?.pincode}, {delivery.deliveryAddress?.country}</p>
                    </div>
                  </div>
                </section>

                {/* Schedule & Cost */}
                <section className="profile-section full-width schedule-container">
                  <div className="schedule-grid">
                    <div>
                      <p className="data-label">Created</p>
                      <p className="data-value-sm">{new Date(delivery.createdAt || delivery.createTime).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div>
                      <p className="data-label">Pickup</p>
                      <p className="data-value-sm">{new Date(delivery.scheduledPickupTime).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div>
                      <p className="data-label">Delivery Est.</p>
                      <p className="data-value-sm">{delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString('en-GB') : 'TBD'}</p>
                    </div>
                    <div className="cost-box">
                      <p className="cost-label">Total Cost</p>
                      <p className="cost-value-lg">₹ {delivery.chargeAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            {/* Network Integrity Box */}
            <div className="integrity-box">
              <img src="/images/logistics_network.png" alt="Network Analytics" />
              <div className="integrity-overlay">
                <div className="integrity-text-group">
                  <h4>Network Integrity Check</h4>
                  <p>Global tracking nodes are monitoring this shipment for warehouse reconciliation.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Span 1) Timeline */}
          <div className="detail-grid-right">
            <div className="dd-card timeline-card">
              <div className="dd-card-header">
                <h3>Tracking Timeline</h3>
                <button 
                  onClick={() => fetchTracking(delivery.trackingNumber)} 
                  style={{ color: '#0051d5', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Refresh
                </button>
              </div>
              
              <div className="timeline-body">
                {loadingEvents ? (
                  <p style={{ color: '#45464d', fontSize: '14px', textAlign: 'center' }}>Loading timeline...</p>
                ) : events.length === 0 ? (
                  <p style={{ color: '#45464d', fontSize: '14px', textAlign: 'center' }}>No tracking events recorded yet.</p>
                ) : (
                  <div className="timeline-container">
                    <div className="timeline-line"></div>
                    {events.map((event, idx) => (
                      <div key={idx} className="timeline-event">
                        <div className="timeline-dot">
                          <div className="timeline-dot-inner"></div>
                        </div>
                        <div className="event-content">
                          <div className="event-header">
                            <h5 className="event-title">{event.status.replace(/_/g, ' ')}</h5>
                            <span className="event-time-badge">
                              {new Date(event.eventTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="event-desc">{event.description}</p>
                          {event.location && (
                            <div className="event-location">
                              <MapPin className="event-location-icon" />
                              <span className="event-location-text">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="timeline-footer">
                <p className="timeline-footer-text">Viewing {events.length} chronological updates</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
