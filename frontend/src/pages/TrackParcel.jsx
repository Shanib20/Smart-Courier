import { useState } from 'react';
import { trackingApi } from '../api/trackingApi';
import { Search, MapPin, Package, Truck, CheckCircle, Clock, AlertCircle, ChevronRight, Map, Calendar, ShieldCheck, Mail, Info, X, Check } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import './TrackParcel.css';

export default function TrackParcel() {
  usePageTitle('Track Parcel');
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

  return (
    <div className="track-page-wrapper">
      <div className="track-max-width">
        {/* Hero Section */}
        <div className="track-hero-box">
          <img src="/images/logistics_hero_bg.png" alt="Logistics Background" className="track-hero-bg" />
          <div className="track-hero-content">
            <h1>Global Precision Tracking</h1>
            <p>Real-time visibility into every node of your supply chain, from booking to final mile delivery.</p>
          </div>
        </div>

        {/* Search Card */}
        <div className="track-search-card">
          <div className="track-search-header">
            <h2>Track Your Shipment</h2>
            <p>Enter your tracking number below to view the current status and historical journey of your parcel.</p>
          </div>
          <form onSubmit={handleTrack} className="track-search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon-abs" size={20} />
              <input 
                type="text" 
                placeholder="Enter Tracking Number (e.g., SC-2026-XXXXXX)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              />
            </div>
            <button type="submit" className="btn-track-now" disabled={loading}>
              <MapPin size={20} />
              {loading ? 'Tracking...' : 'Track Now'}
            </button>
          </form>
        </div>

        {error && (
          <div className="track-error">
            <AlertCircle size={20} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Results Layout */}
        {events && events.length > 0 && (
          <div className="track-results-grid">
            {/* Left: Status Summary */}
            <div className="track-grid-left">
              <div className="track-card">
                <div className="summary-header">
                  <h3>Shipment Summary</h3>
                </div>
                <div className="summary-body">
                  <div>
                    <p className="summary-item-label">Current Status</p>
                    <div className="status-flex">
                      <span className={`status-pill-new ${events[0].status.toLowerCase()}`}>
                        {events[0].status.replace(/_/g, ' ')}
                      </span>
                      <span className="updated-time">
                        Updated {new Date(events[0].eventTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <p className="summary-item-label">Tracking Number</p>
                    <p className="summary-value" style={{ color: '#2563eb' }}>{trackingNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tracking Timeline */}
            <div className="track-grid-right">
              <div className="track-card">
                <div className="journey-header">
                  <h3>Journey Log</h3>
                </div>
                <div className="journey-body">
                  <div className="tl-container">
                    <div className="tl-line"></div>
                    <div className="tl-list">
                      {events.map((event, index) => {
                        const isCurrent = index === 0;
                        return (
                          <div key={event.id} className={`tl-item ${isCurrent ? 'current' : 'completed'}`}>
                            <div className="tl-dot">
                              {isCurrent ? (
                                <div className="tl-dot-inner"></div>
                              ) : (
                                <Check size={14} className="tl-dot-icon" />
                              )}
                            </div>
                            <div className="tl-content">
                              <div className="tl-main-info">
                                <p className="tl-title">{event.status.replace(/_/g, ' ')}</p>
                                <p className="tl-desc">{event.description}</p>
                              </div>
                              <div className="tl-meta">
                                <p className="tl-time">
                                  {new Date(event.eventTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="tl-location">{event.location || 'System'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Map */}
        <div className="track-footer-map">
          <div className="footer-map-content">
            <h2>Real-Time Transit Map</h2>
            <p>Visualize your shipment's global path through our live satellite tracking network.</p>
          </div>
          <div className="footer-map-image">
            <img src="/images/logistics_network.png" alt="Global Logistics Map" />
            <div className="footer-map-gradient"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
