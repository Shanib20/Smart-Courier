import { X, MapPin, Package, Calendar, DollarSign, User, Clock, Info, ShieldCheck, Truck, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackingApi } from '../api/trackingApi';
import './Modal.css';

export default function DeliveryDetailModal({ delivery, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await trackingApi.getTrackingEvents(delivery.trackingNumber);
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to fetch tracking events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [delivery.trackingNumber]);

  return (
    <div className="modal-overlay">
      <div className="modal-content-premium" style={{ maxWidth: '720px' }}>
        <div className="modal-header-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#eff6ff', color: '#0051d5', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
            </div>
            <h2>Delivery Lifecycle: {delivery.trackingNumber}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <div className="modal-body-premium">
          <div className="modal-detail-grid">
            
            {/* Participants */}
            <div className="detail-section-premium">
              <div className="detail-header-premium">
                <User size={16} /> Participants
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-block-premium">
                  <span className="info-label-premium">Sender</span>
                  <div className="info-value-premium">{delivery.senderName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{delivery.senderPhone}</div>
                </div>
                <div className="info-block-premium">
                  <span className="info-label-premium">Receiver</span>
                  <div className="info-value-premium">{delivery.receiverName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{delivery.receiverPhone}</div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="detail-section-premium">
              <div className="detail-header-premium">
                <MapPin size={16} /> Locations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-block-premium">
                  <span className="info-label-premium">Origin</span>
                  <div className="info-value-premium">{delivery.pickupAddress.city}, {delivery.pickupAddress.state}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                    {delivery.pickupAddress.street}<br/>
                    PIN: {delivery.pickupAddress.pincode}
                  </div>
                </div>
                <div className="info-block-premium">
                  <span className="info-label-premium">Destination</span>
                  <div className="info-value-premium">{delivery.deliveryAddress.city}, {delivery.deliveryAddress.state}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                    {delivery.deliveryAddress.street}<br/>
                    PIN: {delivery.deliveryAddress.pincode}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="detail-section-premium">
              <div className="detail-header-premium">
                <Package size={16} /> Package & Service
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-block-premium">
                  <span className="info-label-premium">Type & Weight</span>
                  <div className="info-value-premium">{delivery.packageDetails.packageType}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{delivery.packageDetails.weightKg} KG • {delivery.serviceType}</div>
                </div>
                <div className="info-block-premium">
                  <span className="info-label-premium">Dimensions</span>
                  <div className="info-value-premium">{delivery.packageDetails.dimensions || 'Standard'}</div>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="detail-section-premium">
              <div className="detail-header-premium">
                <DollarSign size={16} /> Financial Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-block-premium">
                  <span className="info-label-premium">Base Fare</span>
                  <div className="info-value-premium">₹{(delivery.chargeAmount * 0.7).toFixed(2)}</div>
                </div>
                <div className="info-block-premium">
                  <span className="info-label-premium">Total Charged</span>
                  <div className="info-value-premium" style={{ color: '#059669', fontWeight: 700 }}>₹{delivery.chargeAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Section */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <div className="detail-header-premium" style={{ marginBottom: '24px' }}>
              <Clock size={16} /> Operational Journey Log
            </div>
            
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', padding: '20px' }}>
                <RefreshCw size={16} className="animate-spin" /> Fetching live tracking data...
              </div>
            ) : events.length > 0 ? (
              <div className="timeline-premium">
                {events.map((event, idx) => (
                  <div key={idx} className="timeline-item-premium">
                    <div className={`timeline-dot-premium ${idx === 0 ? '' : 'past'}`}></div>
                    <div className="timeline-content-premium">
                      <div className="timeline-time-premium">
                        {new Date(event.eventTime).toLocaleDateString()} • {new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="timeline-status-premium">{(event.status || '').replace('_', ' ')}</div>
                      <div className="timeline-desc-premium">
                        {event.description} <ArrowRight size={10} style={{ margin: '0 4px' }} /> <strong>{event.location}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                <Info size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>No operational events have been recorded for this shipment yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer-premium">
          <button onClick={onClose} className="btn-premium-solid">Close Record</button>
        </div>
      </div>
    </div>
  );
}
