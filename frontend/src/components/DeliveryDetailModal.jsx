import { X, MapPin, Package, Calendar, DollarSign, User, Clock } from 'lucide-react';
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
        setEvents(data);
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
      <div className="modal-content detail-modal slide-up">
        <div className="modal-header">
          <h2>Delivery Details: {delivery.trackingNumber}</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="detail-sections">
            <section className="detail-section">
              <h3><User size={18} /> Participants</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Sender</span>
                  <p><strong>{delivery.senderName}</strong></p>
                  <p>{delivery.senderPhone}</p>
                </div>
                <div className="info-item">
                  <span className="label">Receiver</span>
                  <p><strong>{delivery.receiverName}</strong></p>
                  <p>{delivery.receiverPhone}</p>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3><MapPin size={18} /> Addresses</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Pickup</span>
                  <p>{delivery.pickupAddress.street}, {delivery.pickupAddress.city}</p>
                  <p>{delivery.pickupAddress.state} - {delivery.pickupAddress.pincode}</p>
                </div>
                <div className="info-item">
                  <span className="label">Delivery</span>
                  <p>{delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}</p>
                  <p>{delivery.deliveryAddress.state} - {delivery.deliveryAddress.pincode}</p>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3><Package size={18} /> Package & Price</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Details</span>
                  <p>{delivery.packageDetails.packageType} ({delivery.packageDetails.weightKg}kg)</p>
                  <p>{delivery.serviceType} Service</p>
                </div>
                <div className="info-item">
                  <span className="label">Cost Breakdown</span>
                  <p>Base: ₹{(delivery.chargeAmount * 0.7).toFixed(2)}</p>
                  <p>Total: <strong>₹{delivery.chargeAmount.toFixed(2)}</strong></p>
                </div>
              </div>
            </section>

            <section className="detail-section full-width">
              <h3><Clock size={18} /> Tracking Timeline</h3>
              {loading ? (
                <p>Loading timeline...</p>
              ) : events.length > 0 ? (
                <div className="mini-timeline">
                  {events.map((event, idx) => (
                    <div key={idx} className="mini-timeline-item">
                      <div className="time">{new Date(event.eventTime).toLocaleString()}</div>
                      <div className="status">{event.status}</div>
                      <div className="desc">{event.description} at {event.location}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No tracking events recorded yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
