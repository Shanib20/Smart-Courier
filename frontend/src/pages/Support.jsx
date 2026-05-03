import { useState } from 'react';
import { MessageCircle, Package, XCircle, CreditCard, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import './Support.css';

const ISSUES = [
  {
    icon: <Package size={24}/>,
    label: "Track my parcel",
    message: "Hi SwiftCourier, I need help tracking my parcel. Tracking ID: "
  },
  {
    icon: <XCircle size={24}/>, 
    label: "Cancel my booking",
    message: "Hi SwiftCourier, I want to cancel my booking. Tracking ID: "
  },
  {
    icon: <CreditCard size={24}/>,
    label: "Payment or refund",
    message: "Hi SwiftCourier, I have a payment or refund issue. Please help."
  },
  {
    icon: <Edit size={24}/>,
    label: "Wrong details",
    message: "Hi SwiftCourier, I provided wrong delivery details and need to correct them. Tracking ID: "
  }
];

const FAQS = [
  {
    q: "How do I track my parcel?",
    a: "Go to 'Track Parcel' in the sidebar and enter your tracking ID (e.g., SC-2026-XXXXXX). You'll see a real-time timeline of your shipment's journey."
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes, you can cancel your booking within 1 hour of creation. Simply go to 'My Deliveries' and click the 'Cancel' button on the shipment card."
  },
  {
    q: "How long does delivery take?",
    a: "Domestic deliveries typically take 2-7 business days depending on the distance. International shipments can take 5-12 days including customs clearance."
  }
];

export default function Support() {
  usePageTitle('Support');
  const [openFaq, setOpenFaq] = useState(null);

  const openWhatsApp = (msg) => {
    const url = `https://wa.me/919633411055?text=${encodeURIComponent(msg || "Hi SwiftCourier, I need help with my delivery")}`;
    window.open(url, '_blank');
  };

  return (
    <div className="support-page-wrapper">
      <div className="support-max-width">
        {/* Hero Section */}
        <section className="support-hero">
          <img src="/images/support_hero_bg.png" alt="Futuristic logistics hub" className="support-hero-bg" />
          <div className="support-hero-gradient"></div>
          <div className="support-hero-content">
            <h2>Help & Support</h2>
            <p>Our dedicated support infrastructure is designed to provide you with surgical precision in problem-solving and operational assistance.</p>
          </div>
        </section>

        <div className="support-grid">
          {/* Main Column */}
          <div className="support-col-main support-col-group">
            {/* Most Popular */}
            <div className="support-card">
              <h3 className="support-card-title">Most Popular</h3>
              <div className="popular-banner">
                <div className="popular-content">
                  <div className="popular-badge-wrap">
                    <MessageCircle className="popular-badge-icon" size={16} fill="currentColor" />
                    <span className="popular-badge-text">Live Instant Support</span>
                  </div>
                  <h4>Chat with our support team instantly</h4>
                  <p>Get real-time resolutions for your urgent logistics queries. Connect with a human specialist via our secure WhatsApp channel.</p>
                  <div className="popular-actions">
                    <button className="btn-whatsapp" onClick={() => openWhatsApp("")}>
                      <MessageCircle size={18} /> Open WhatsApp Chat
                    </button>
                    <div className="availability-info">
                      <p>Availability</p>
                      <p>Mon - Sat, 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
                <div className="popular-image">
                  <img src="/images/support_whatsapp_graphic.png" alt="Secure messaging support" />
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="support-card">
              <h3 className="support-card-title">Quick Help for Common Issues</h3>
              <div className="quick-help-grid">
                {ISSUES.map((issue, idx) => (
                  <button key={idx} className="quick-btn" onClick={() => openWhatsApp(issue.message)}>
                    <div className="quick-icon-wrap">
                      {issue.icon}
                    </div>
                    <span className="quick-label">{issue.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="support-card">
              <h3 className="support-card-title">Frequently Asked Questions</h3>
              <div className="faq-list">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="faq-item-row">
                    <button className="faq-btn" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                      <span>{faq.q}</span>
                      {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {openFaq === idx && (
                      <div className="faq-answer-content">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="support-col-side support-col-group">
            {/* Support Hours */}
            <div className="support-card">
              <div className="hours-header-flex">
                <h3>Support Hours</h3>
                <div className="open-badge">
                  <div className="open-badge-dot"></div>
                  WE ARE OPEN
                </div>
              </div>
              <div className="hours-rows">
                <div className="hours-row">
                  <span className="hours-day">Monday - Saturday</span>
                  <span className="hours-time">09:00 - 18:00 IST</span>
                </div>
                <div className="hours-row border-top">
                  <span className="hours-day">Sunday</span>
                  <span className="hours-closed">CLOSED</span>
                </div>
              </div>
              <div className="expected-response">
                <p>Expected response time: 2-4 minutes during peak hours.</p>
              </div>
            </div>

            {/* Help Center Graphic */}
            <div className="lobby-graphic">
              <img src="/images/support_lobby_graphic.png" alt="Corporate office lobby" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
