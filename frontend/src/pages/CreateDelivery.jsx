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
  IndianRupee,
  Send,
  Loader2,
  UserCheck
} from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { profileApi } from '../api/profileApi';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import './BookDelivery.css';

const STEPS = [
  { id: 1, title: 'Service Type', icon: Globe },
  { id: 2, title: 'Addresses', icon: MapPin },
  { id: 3, title: 'Package', icon: Package },
  { id: 4, title: 'Review', icon: CheckCircle }
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "United Arab Emirates", "Australia", 
  "Germany", "France", "Singapore", "Japan", "China", "Brazil", "South Africa", 
  "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Italy", "Spain", "Netherlands", 
  "Switzerland", "Malaysia", "Thailand", "New Zealand", "Ireland"
].sort();

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function CreateDelivery() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [useDefault, setUseDefault] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'DOMESTIC', 
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

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const profile = await profileApi.getProfile();
        const def = profile.addresses.find(a => a.default);
        if (def) setDefaultAddress(def);
      } catch (err) {
        console.error("Failed to load default address", err);
      }
    };
    fetchDefault();
  }, []);

  // Live Price Quote Effect
  useEffect(() => {
    if (step === 3 && formData.packageDetails.weightKg > 0 && formData.pickupAddress.pincode && (formData.type === 'INTERNATIONAL' ? formData.deliveryAddress.country : formData.deliveryAddress.pincode)) {
      const fetchQuote = async () => {
        try {
          const res = await deliveryApi.getQuote(
            formData.pickupAddress.pincode,
            formData.type === 'INTERNATIONAL' ? '999999' : formData.deliveryAddress.pincode,
            formData.packageDetails.weightKg
          );
          // Adjust for international pricing
          if (formData.type === 'INTERNATIONAL') {
            res.totalAmount = 1100 + (formData.packageDetails.weightKg * 550);
          } else {
            // Ensure domestic also matches the breakdown
            res.totalAmount = 100 + (formData.packageDetails.weightKg * 50);
          }
          setQuote(res);
        } catch (err) {
          console.error("Pricing error", err);
        }
      };
      fetchQuote();
    }
  }, [step, formData.packageDetails.weightKg, formData.pickupAddress.pincode, formData.deliveryAddress.pincode, formData.deliveryAddress.country, formData.type]);

  const handleUseDefault = (e) => {
    const checked = e.target.checked;
    setUseDefault(checked);
    if (checked && defaultAddress) {
      setFormData({
        ...formData,
        senderName: defaultAddress.fullName,
        senderPhone: defaultAddress.phone,
        pickupAddress: {
          street: defaultAddress.line1,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          country: 'India'
        }
      });
    } else {
      setFormData({
        ...formData,
        senderName: user?.name || '',
        senderPhone: '',
        pickupAddress: { street: '', city: '', state: '', pincode: '', country: 'India' }
      });
    }
  };

  const validateStep = () => {
    let newErrors = {};
    
    if (step === 2) {
      // Step 2: Contact & Address Validation
      if (!formData.senderName.trim()) newErrors.senderName = "Sender name is required";
      if (!PHONE_REGEX.test(formData.senderPhone)) newErrors.senderPhone = "Enter valid 10-digit Indian number";
      if (!formData.pickupAddress.street.trim()) newErrors.pickupStreet = "Street address is required";
      
      if (!formData.receiverName.trim()) newErrors.receiverName = "Receiver name is required";
      if (!PHONE_REGEX.test(formData.receiverPhone)) newErrors.receiverPhone = "Enter valid 10-digit Indian number";
      if (!formData.deliveryAddress.street.trim()) newErrors.deliveryStreet = "Street address is required";

      if (formData.type === 'DOMESTIC') {
        if (!formData.pickupAddress.pincode) newErrors.pickupPincode = "Pincode required";
        if (!formData.deliveryAddress.pincode) newErrors.deliveryPincode = "Pincode required";
      } else {
        if (!formData.deliveryAddress.country) newErrors.deliveryCountry = "Country required";
      }
    }

    if (step === 3) {
      // Step 3: Package Validation
      const weight = parseFloat(formData.packageDetails.weightKg);
      if (!weight || weight <= 0 || isNaN(weight)) {
        newErrors.weight = "Enter a valid weight greater than 0";
      }
      if (!formData.scheduledPickupTime) {
        newErrors.pickupTime = "Please select a pickup time";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      addToast("Please correct the errors in the form", "error");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        serviceType: formData.type,
        scheduledPickupTime: formData.scheduledPickupTime || new Date().toISOString()
      };
      await deliveryApi.createDelivery(payload);
      addToast('Shipment booked successfully!', 'success');
      window.location.href = '/deliveries';
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
            
            {defaultAddress && (
              <div className="autofill-box">
                <label>
                  <input type="checkbox" checked={useDefault} onChange={handleUseDefault} />
                  <UserCheck size={18} /> Use my Default Profile Address for Pickup
                </label>
              </div>
            )}

            <div className="form-grid">
              <div className="form-section">
                <h4>Sender Details</h4>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className={`input-field ${errors.senderName ? 'error' : ''}`} value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} readOnly={useDefault} />
                  {errors.senderName && <span className="error-text">{errors.senderName}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number (10 digits)</label>
                  <input type="tel" className={`input-field ${errors.senderPhone ? 'error' : ''}`} value={formData.senderPhone} onChange={e => setFormData({...formData, senderPhone: e.target.value})} placeholder="9876543210" readOnly={useDefault} />
                  {errors.senderPhone && <span className="error-text">{errors.senderPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Street / Area</label>
                  <input type="text" className={`input-field ${errors.pickupStreet ? 'error' : ''}`} value={formData.pickupAddress.street} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, street: e.target.value}})} readOnly={useDefault} />
                  {errors.pickupStreet && <span className="error-text">{errors.pickupStreet}</span>}
                </div>
                <div className="form-row">
                  <input type="text" placeholder="City" className="input-field" value={formData.pickupAddress.city} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, city: e.target.value}})} readOnly={useDefault} />
                  <input type="text" placeholder="Pincode" className={`input-field ${errors.pickupPincode ? 'error' : ''}`} value={formData.pickupAddress.pincode} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, pincode: e.target.value}})} readOnly={useDefault} />
                </div>
              </div>

              <div className="form-section">
                <h4>Receiver Details</h4>
                <div className="form-group">
                  <label>Receiver Name</label>
                  <input type="text" className={`input-field ${errors.receiverName ? 'error' : ''}`} value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} />
                  {errors.receiverName && <span className="error-text">{errors.receiverName}</span>}
                </div>
                <div className="form-group">
                  <label>Receiver Phone</label>
                  <input type="tel" className={`input-field ${errors.receiverPhone ? 'error' : ''}`} value={formData.receiverPhone} onChange={e => setFormData({...formData, receiverPhone: e.target.value})} />
                  {errors.receiverPhone && <span className="error-text">{errors.receiverPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Street / Area</label>
                  <input type="text" className={`input-field ${errors.deliveryStreet ? 'error' : ''}`} value={formData.deliveryAddress.street} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, street: e.target.value}})} />
                  {errors.deliveryStreet && <span className="error-text">{errors.deliveryStreet}</span>}
                </div>
                {formData.type === 'INTERNATIONAL' ? (
                  <div className="form-group">
                    <label>Destination Country</label>
                    <select className="input-field" value={formData.deliveryAddress.country} onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress, country: e.target.value}})}>
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                    className={`input-field ${errors.weight ? 'error' : ''}`} 
                    value={formData.packageDetails.weightKg} 
                    onChange={e => setFormData({...formData, packageDetails: {...formData.packageDetails, weightKg: parseFloat(e.target.value)}})} 
                    min="0.1" 
                    step="0.1"
                  />
                  {errors.weight && <span className="error-text">{errors.weight}</span>}
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
                    className={`input-field ${errors.pickupTime ? 'error' : ''}`} 
                    value={formData.scheduledPickupTime} 
                    onChange={e => setFormData({...formData, scheduledPickupTime: e.target.value})} 
                  />
                  {errors.pickupTime && <span className="error-text">{errors.pickupTime}</span>}
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
                      <span>{formData.type} Shipping</span>
                      <span>Trackable</span>
                    </div>
                  </div>
                ) : (
                  <p className="quote-loading">Enter weight and destination to see live pricing...</p>
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
                  <span>₹{formData.type === 'DOMESTIC' ? '100.00' : '1100.00'}</span>
                </div>
                <div className="breakdown-item">
                  <span>Weight Surcharge ({formData.packageDetails.weightKg}kg × ₹{formData.type === 'DOMESTIC' ? '50' : '550'})</span>
                  <span>₹{formData.packageDetails.weightKg * (formData.type === 'DOMESTIC' ? 50 : 550)}</span>
                </div>
                <div className="total-divider"></div>
                <div className="breakdown-item total">
                  <span>Total Amount</span>
                  <span>₹{formData.type === 'DOMESTIC' ? (100 + formData.packageDetails.weightKg * 50) : (1100 + formData.packageDetails.weightKg * 550)}</span>
                </div>
                <div className="delivery-promise">
                  <Truck size={14} /> Estimated Delivery: {quote?.estimatedDays || '---'} Days
                </div>
                <div className="policy-disclaimer">
                  <Clock size={12} /> Cancellation is only allowed within 1 hour of booking.
                </div>
              </div>
            </div>

            <div className="actions-between">
              <button className="btn btn-outline" onClick={() => setStep(3)}><ChevronLeft size={18}/> Back</button>
              <button className="btn btn-primary btn-book" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="spinner" /> : <><Send size={18} /> Confirm & Book Now</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
