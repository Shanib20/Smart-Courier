import { useState } from 'react';
import { trackingApi } from '../api/trackingApi';
import { Search, MapPin, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import './TrackParcel.css';

export default function TrackParcel() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setEvents(null);

    try {
      const data = await trackingApi.getTrackingEvents(trackingNumber.trim());
      setEvents(data || []);
      if (data.length === 0) {
        setError('No tracking information found for this number.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tracking information. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="status-icon text-success" />;
      case 'CANCELLED':
      case 'FAILED': return <AlertCircle className="status-icon text-danger" />;
      case 'IN_TRANSIT': return <Clock className="status-icon text-warning" />;
      default: return <Package className="status-icon text-accent" />;
    }
  };

  return (
    <div className="track-container">
      <div className="track-header">
        <h1>Track Your Shipment</h1>
        <p>Enter your tracking number to get real-time updates.</p>
        
        <form onSubmit={handleTrack} className="track-search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="SC-2026-XXXXXX"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Now'}
          </button>
        </form>
      </div>

      {error && (
        <div className="track-error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="tracking-timeline-card slide-up">
          <div className="tracking-info-summary">
            <div>
              <span className="label">Tracking Number</span>
              <span className="value">{trackingNumber}</span>
            </div>
            <div>
              <span className="label">Current Status</span>
              <span className={`status-pill status-${events[0].status.toLowerCase()}`}>
                {events[0].status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="timeline">
            {events.map((event, index) => (
              <div key={event.id} className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                <div className="timeline-marker">
                  {getStatusIcon(event.status)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{event.status.replace(/_/g, ' ')}</h3>
                    <span className="time">
                      {new Date(event.eventTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <div className="location">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  {event.description && (
                    <p className="description">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
