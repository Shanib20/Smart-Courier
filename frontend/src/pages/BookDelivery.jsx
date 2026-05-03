import { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Search,
  AlertCircle,
  Globe,
  Info,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import './BookDelivery.css';

const STEPS = [
  { id: 1, title: 'Service Type', icon: Globe },
  { id: 2, title: 'Addresses', icon: MapPin },
  { id: 3, title: 'Package', icon: Package },
  { id: 4, title: 'Review', icon: CheckCircle }
];

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function BookDelivery() {
  usePageTitle('New Delivery');
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'DOMESTIC', // DOMESTIC or INTERNATIONAL
    senderName: user?.name || '',
    senderPhone: '',
    pickupAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: { street: '', city: '', state: '', pincode: '', country: '' },
    packageDetails: { weightKg: 1, type: 'DOCUMENT', dimensions: 'Standard' },
    scheduledPickupTime: ''
  });

  const [errors, setErrors] = useState({});

  // Live Price Quote Effect
  useEffect(() => {
    if (step === 3 && formData.packageDetails.weightKg > 0 && formData.pickupAddress.pincode && formData.deliveryAddress.pincode) {
      const fetchQuote = async () => {
        try {
          const res = await deliveryApi.getQuote(
            formData.pickupAddress.pincode,
            formData.deliveryAddress.pincode,
            formData.packageDetails.weightKg
          );
          setQuote(res);
        } catch (err) {
          console.error("Pricing error", err);
        }
      };
      fetchQuote();
    }
  }, [step, formData.packageDetails.weightKg, formData.pickupAddress.pincode, formData.deliveryAddress.pincode]);

  const validateStep = () => {
    let newErrors = {};
    if (step === 2) {
      if (!PHONE_REGEX.test(formData.senderPhone)) newErrors.senderPhone = "Enter valid 10-digit Indian number";
      if (!PHONE_REGEX.test(formData.receiverPhone)) newErrors.receiverPhone = "Enter valid 10-digit Indian number";
      if (formData.type === 'DOMESTIC') {
        if (!formData.pickupAddress.pincode) newErrors.pickupPincode = "Required";
        if (!formData.deliveryAddress.pincode) newErrors.deliveryPincode = "Required";
      } else {
        if (!formData.deliveryAddress.country) newErrors.deliveryCountry = "Country required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deliveryApi.createDelivery(formData);
      addToast('Shipment booked successfully!', 'success');
      window.location.href = '/my-deliveries';
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-delivery-container slide-up">
      <div className="booking-header">
        <h1>Book a Shipment</h1>
        <p>Send packages anywhere in India or across the globe.</p>
      </div>

      <div className="stepper">
        {STEPS.map((s) => (
          <div key={s.id} className={`step-item ${step >= s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
            <div className="step-icon">
              {step > s.id ? <CheckCircle size={20} /> : <s.icon size={20} />}
            </div>
            <span>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="booking-form-card">
        {step === 1 && (
          <div className="step-content">
            <h3>Choose Service Type</h3>
            <div className="type-selector">
              <button 
                className={`type-card ${formData.type === 'DOMESTIC' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, type: 'DOMESTIC'})}
              >
                <div className="card-icon"><Package size={32}/></div>
                <div className="card-info">
                  <h4>Domestic</h4>
                  <p>Pan-India coverage. 2-7 days estimated delivery.</p>
                </div>
              </button>
              <button 
                className={`type-card ${formData.type === 'INTERNATIONAL' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, type: 'INTERNATIONAL'})}
              >
                <div className="card-icon"><Globe size={32}/></div>
                <div className="card-info">
                  <h4>International</h4>
                  <p>Worldwide shipping. Customs handling included.</p>
                </div>
              </button>
            </div>
            <div className="actions-right">
              <button className="btn btn-primary" onClick={handleNext}>Next Step <ChevronRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>Contact & Address Details</h3>
            <div className="form-grid">
              <div className="form-section">
                <h4>Sender Details</h4>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number (10 digits)</label>
                  <input type="tel" className={`input-field ${errors.senderPhone ? 'error' : ''}`} value={formData.senderPhone} onChange={e => setFormData({...formData, senderPhone: e.target.value})} placeholder="9876543210" />
                  {errors.senderPhone && <span className="error-text">{errors.senderPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Street / Area</label>
                  <input type="text" className="input-field" value={formData.pickupAddress.street} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, street: e.target.value}})} />
                </div>
                <div className="form-row">
                  <input type="text" placeholder="City" className="input-field" value={formData.pickupAddress.city} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, city: e.target.value}})} />
                  <input type="text" placeholder="Pincode" className={`input-field ${errors.pickupPincode ? 'error' : ''}`} value={formData.pickupAddress.pincode} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, pincode: e.target.value}})} />
                </div>
              </div>

              <div className="form-section">
                <h4>Receiver Details</h4>
                <div className="form-group">
                  <label>Receiver Name</label>
                  <input type="text" className="input-field" value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Receiver Phone</label>
                  <input type="tel" className={`input-field ${errors.receiverPhone ? 'error' : ''}`} value={formData.receiverPhone} onChange={e => setFormData({...formData, receiverPhone: e.target.value})} />
                  {errors.receiverPhone && <span className="error-text">{errors.receiverPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Street / Area</label>
                  <input type="text" className="input-field" value={formData.deliveryAddress.street} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, street: e.target.value}})} />
                </div>
                {formData.type === 'INTERNATIONAL' ? (
                  <div className="form-group">
                    <label>Country</label>
                    <select className="input-field" value={formData.deliveryAddress.country} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, country: e.target.value}})}>
                      <option value="">Select Country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-row">
                    <input type="text" placeholder="City" className="input-field" value={formData.deliveryAddress.city} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, city: e.target.value}})} />
                    <input type="text" placeholder="Pincode" className="input-field" value={formData.deliveryAddress.pincode} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, pincode: e.target.value}})} />
                  </div>
                )}
              </div>
            </div>
            <div className="actions-between">
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Next: Package <ChevronRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3>Package Information</h3>
            <div className="package-grid">
              <div className="form-section">
                <div className="form-group">
                  <label>Package Weight (Kg)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.packageDetails.weightKg} 
                    onChange={e => setFormData({...formData, packageDetails: {...formData.packageDetails, weightKg: parseFloat(e.target.value)}})} 
                    min="0.1" 
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Package Type</label>
                  <select className="input-field" value={formData.packageDetails.type} onChange={e => setFormData({...formData, packageDetails: {...formData.packageDetails, type: e.target.value}})}>
                    <option value="DOCUMENT">Document</option>
                    <option value="PARCEL">Standard Parcel</option>
                    <option value="FRAGILE">Fragile Items</option>
                    <option value="ELECTRONICS">Electronics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pickup Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="input-field" 
                    value={formData.scheduledPickupTime} 
                    onChange={e => setFormData({...formData, scheduledPickupTime: e.target.value})} 
                  />
                </div>
              </div>

              <div className="quote-display-card">
                <div className="quote-header">
                  <Info size={16} /> Estimated Quote
                </div>
                {quote ? (
                  <div className="quote-body">
                    <div className="price">₹{quote.totalAmount}</div>
                    <p className="delivery-days"><Calendar size={14}/> Expected in {quote.estimatedDays} days</p>
                    <div className="quote-tags">
                      <span>Standard Shipping</span>
                      <span>Trackable</span>
                    </div>
                  </div>
                ) : (
                  <p className="quote-loading">Enter weight and pincodes to see live pricing...</p>
                )}
              </div>
            </div>
            <div className="actions-between">
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={18}/> Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Review Booking <ChevronRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h3>Final Review & Payment</h3>
            <div className="review-container">
              <div className="review-grid">
                <div className="review-section">
                  <h5>Shipment Route</h5>
                  <p><strong>From:</strong> {formData.pickupAddress.city} ({formData.pickupAddress.pincode})</p>
                  <p><strong>To:</strong> {formData.deliveryAddress.city} ({formData.deliveryAddress.pincode || formData.deliveryAddress.country})</p>
                </div>
                <div className="review-section">
                  <h5>Receiver Contact</h5>
                  <p>{formData.receiverName}</p>
                  <p>{formData.receiverPhone}</p>
                </div>
              </div>

              <div className="pricing-breakdown">
                <div className="breakdown-header">Fare Breakdown</div>
                <div className="breakdown-item">
                  <span>Base Shipping Fee</span>
                  <span>₹{formData.type === 'DOMESTIC' ? '100.00' : '500.00'}</span>
                </div>
                <div className="breakdown-item">
                  <span>Weight Surcharge ({formData.packageDetails.weightKg}kg × ₹50)</span>
                  <span>₹{formData.packageDetails.weightKg * 50}</span>
                </div>
                <div className="total-divider"></div>
                <div className="breakdown-item total">
                  <span>Total Amount</span>
                  <span>₹{quote?.totalAmount || '---'}</span>
                </div>
                <div className="delivery-promise">
                  <Truck size={14} /> Estimated Delivery: {quote?.estimatedDays || '---'} Days
                </div>
              </div>
            </div>

            <div className="actions-between">
              <button className="btn btn-outline" onClick={() => setStep(3)}><ChevronLeft size={18}/> Back</button>
              <button className="btn btn-primary btn-book" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm & Book Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
