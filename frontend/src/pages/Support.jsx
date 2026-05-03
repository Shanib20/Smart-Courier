import { useState } from 'react';
import { 
  Headset, 
  MessageCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Package,
  XCircle,
  CreditCard,
  Edit,
  ArrowRight
} from 'lucide-react';
import './Support.css';

const ISSUES = [
  {
    icon: <Package size={24}/>,
    label: "Track my parcel",
    color: "#3b82f6",
    message: "Hi SwiftCourier, I need help tracking my parcel. Tracking ID: "
  },
  {
    icon: <XCircle size={24}/>, 
    label: "Cancel my booking",
    color: "#ef4444",
    message: "Hi SwiftCourier, I want to cancel my booking. Tracking ID: "
  },
  {
    icon: <CreditCard size={24}/>,
    label: "Payment or refund",
    color: "#f59e0b",
    message: "Hi SwiftCourier, I have a payment or refund issue. Please help."
  },
  {
    icon: <Edit size={24}/>,
    label: "Wrong details",
    color: "#8b5cf6",
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
  const [openFaq, setOpenFaq] = useState(null);

  const openWhatsApp = (msg) => {
    const url = `https://wa.me/919633411055?text=${encodeURIComponent(msg || "Hi SwiftCourier, I need help with my delivery")}`;
    window.open(url, '_blank');
  };

  return (
    <div className="support-container slide-up">
      <div className="support-header">
        <h1>Help & Support</h1>
        <p>We're here to ensure your shipping experience is smooth and hassle-free.</p>
      </div>

      <div className="whatsapp-main-card">
        <div className="whatsapp-info">
          <div className="wa-badge">Most Popular</div>
          <h2>Chat with our support team instantly</h2>
          <p>Available Monday to Saturday, 9:00 AM to 6:00 PM IST</p>
          <button className="wa-btn" onClick={() => openWhatsApp("")}>
            <MessageCircle size={20} /> Open WhatsApp Chat
          </button>
        </div>
        <div className="wa-visual">
          <Headset size={80} strokeWidth={1} />
        </div>
      </div>

      <div className="quick-issues-section">
        <h3>Quick Help for Common Issues</h3>
        <div className="issues-grid">
          {ISSUES.map((issue, idx) => (
            <button key={idx} className="issue-card" onClick={() => openWhatsApp(issue.message)}>
              <div className="issue-icon" style={{ color: issue.color }}>
                {issue.icon}
              </div>
              <span>{issue.label}</span>
              <ArrowRight size={16} className="arrow" />
            </button>
          ))}
        </div>
      </div>

      <div className="support-split-grid">
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-list">
            {FAQS.map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
                {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="hours-section">
          <div className="hours-card">
            <div className="hours-header">
              <Clock size={24} />
              <h3>Support Hours</h3>
            </div>
            <div className="hours-list">
              <div className="hour-row">
                <span>Monday - Saturday</span>
                <strong>9:00 AM - 6:00 PM IST</strong>
              </div>
              <div className="hour-row">
                <span>Sunday</span>
                <strong className="closed">Closed</strong>
              </div>
            </div>
            <div className="urgent-note">
              <p>For urgent issues, WhatsApp us anytime and we'll respond on the next business day.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
