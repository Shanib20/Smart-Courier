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
  Send,
  Loader2,
  UserCheck,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

const COUNTRY_MARKERS = {
  "United States": "INT-USA",
  "United Kingdom": "INT-UK",
  "Canada": "INT-CAN",
  "United Arab Emirates": "INT-UAE",
  "South Africa": "INT-SA"
};

const COUNTRIES = Object.keys(COUNTRY_MARKERS).sort();

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
            formData.type === 'INTERNATIONAL' ? (COUNTRY_MARKERS[formData.deliveryAddress.country] || '999999') : formData.deliveryAddress.pincode,
            formData.packageDetails.weightKg
          );
          setQuote(res);
        } catch (err) {
          console.error("Pricing error", err);
        }
      };
      fetchQuote();
    }
  }, [step, formData.packageDetails.weightKg, formData.pickupAddress.pincode, formData.deliveryAddress.pincode, formData.deliveryAddress.country, formData.type]);

  // Pincode Lookup - Pickup
  useEffect(() => {
    const pincode = formData.pickupAddress.pincode;
    if (pincode && pincode.length === 6) {
      const fetchAddress = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              pickupAddress: {
                ...prev.pickupAddress,
                city: postOffice.District,
                state: postOffice.State
              }
            }));
          }
        } catch (err) {
          console.error("Pincode lookup failed", err);
        }
      };
      fetchAddress();
    }
  }, [formData.pickupAddress.pincode]);

  // Pincode Lookup - Delivery
  useEffect(() => {
    const pincode = formData.deliveryAddress.pincode;
    if (pincode && pincode.length === 6 && formData.type === 'DOMESTIC') {
      const fetchAddress = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              deliveryAddress: {
                ...prev.deliveryAddress,
                city: postOffice.District,
                state: postOffice.State
              }
            }));
          }
        } catch (err) {
          console.error("Pincode lookup failed", err);
        }
      };
      fetchAddress();
    }
  }, [formData.deliveryAddress.pincode, formData.type]);

  const updateField = (section, field, value, errorKey) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    
    if (errorKey) {
      const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
      if (isEmpty) {
        let msg = "This field is required";
        if (field.toLowerCase().includes('name')) msg = field.toLowerCase().includes('sender') ? "Sender name is required" : "Receiver name is required";
        if (field.toLowerCase().includes('phone')) msg = "Enter valid 10-digit Indian number";
        if (field.toLowerCase().includes('street')) msg = "Street address is required";
        if (field.toLowerCase().includes('pincode')) msg = "Pincode required";
        if (field.toLowerCase().includes('country')) msg = "Country required";
        if (field.toLowerCase().includes('weight')) msg = "Enter a valid weight";
        if (field.toLowerCase().includes('time')) msg = "Please select a pickup time";
        
        setErrors(prev => ({ ...prev, [errorKey]: msg }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  };

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
      setErrors({});
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
        deliveryAddress: {
          ...formData.deliveryAddress,
          pincode: formData.type === 'INTERNATIONAL' ? (COUNTRY_MARKERS[formData.deliveryAddress.country] || '999999') : formData.deliveryAddress.pincode
        },
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
        <h1>New Delivery</h1>
        <p>Send packages anywhere in India or across the globe.</p>
      </div>

      <div className="stepper">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="step-wrapper" style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            <div className={`step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
              <div className="step-icon">
                {step > s.id ? <CheckCircle size={18} /> : <span>{s.id}</span>}
              </div>
              <span>{s.title}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="stepper-divider" />}
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
                <div className="card-icon"><Package size={24}/></div>
                <div className="card-info">
                  <h4>Domestic Delivery</h4>
                  <p>Pan-India coverage. 2-7 days estimated delivery.</p>
                </div>
              </button>
              <button 
                className={`type-card ${formData.type === 'INTERNATIONAL' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, type: 'INTERNATIONAL'})}
              >
                <div className="card-icon"><Globe size={24}/></div>
                <div className="card-info">
                  <h4>International Shipping</h4>
                  <p>Worldwide shipping. Customs handling included.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>Addresses & Contact</h3>
            
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
                <div className="form-section-header">
                  <UserCheck className="icon" size={20} />
                  <h4>Sender Details</h4>
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className={`input-field ${errors.senderName ? 'error' : ''}`} value={formData.senderName} onChange={e => updateField(null, 'senderName', e.target.value, 'senderName')} readOnly={useDefault} placeholder="Enter full name" />
                  {errors.senderName && <span className="error-text">{errors.senderName}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" className={`input-field ${errors.senderPhone ? 'error' : ''}`} value={formData.senderPhone} onChange={e => updateField(null, 'senderPhone', e.target.value, 'senderPhone')} placeholder="Enter 10-digit number" readOnly={useDefault} />
                  {errors.senderPhone && <span className="error-text">{errors.senderPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Pickup Address</label>
                  <input type="text" className={`input-field ${errors.pickupStreet ? 'error' : ''}`} value={formData.pickupAddress.street} onChange={e => updateField('pickupAddress', 'street', e.target.value, 'pickupStreet')} placeholder="Enter street, building, area" readOnly={useDefault} />
                  {errors.pickupStreet && <span className="error-text">{errors.pickupStreet}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" className="input-field" value={formData.pickupAddress.city} onChange={e => updateField('pickupAddress', 'city', e.target.value, 'pickupCity')} readOnly={useDefault} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input type="text" className={`input-field ${errors.pickupPincode ? 'error' : ''}`} value={formData.pickupAddress.pincode} onChange={e => updateField('pickupAddress', 'pincode', e.target.value, 'pickupPincode')} readOnly={useDefault} placeholder="Pincode" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-header">
                  <MapPin className="icon" size={20} />
                  <h4>Receiver Details</h4>
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className={`input-field ${errors.receiverName ? 'error' : ''}`} value={formData.receiverName} onChange={e => updateField(null, 'receiverName', e.target.value, 'receiverName')} placeholder="Enter full name" />
                  {errors.receiverName && <span className="error-text">{errors.receiverName}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" className={`input-field ${errors.receiverPhone ? 'error' : ''}`} value={formData.receiverPhone} onChange={e => updateField(null, 'receiverPhone', e.target.value, 'receiverPhone')} placeholder="Enter 10-digit number" />
                  {errors.receiverPhone && <span className="error-text">{errors.receiverPhone}</span>}
                </div>
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input type="text" className={`input-field ${errors.deliveryStreet ? 'error' : ''}`} value={formData.deliveryAddress.street} onChange={e => updateField('deliveryAddress', 'street', e.target.value, 'deliveryStreet')} placeholder="Enter street, building, area" />
                  {errors.deliveryStreet && <span className="error-text">{errors.deliveryStreet}</span>}
                </div>
                {formData.type === 'INTERNATIONAL' ? (
                  <div className="form-group">
                    <label>Destination Country</label>
                    <select className="input-field" value={formData.deliveryAddress.country} onChange={e => updateField('deliveryAddress', 'country', e.target.value, 'deliveryCountry')}>
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.deliveryCountry && <span className="error-text">{errors.deliveryCountry}</span>}
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" className="input-field" value={formData.deliveryAddress.city} onChange={e => updateField('deliveryAddress', 'city', e.target.value, 'deliveryCity')} placeholder="City" />
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input type="text" className={`input-field ${errors.deliveryPincode ? 'error' : ''}`} value={formData.deliveryAddress.pincode} onChange={e => updateField('deliveryAddress', 'pincode', e.target.value, 'deliveryPincode')} placeholder="Pincode" />
                    </div>
                  </div>
                )}
              </div>
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
                    onChange={e => updateField('packageDetails', 'weightKg', parseFloat(e.target.value), 'weight')} 
                    min="0.1" 
                    step="0.1"
                    placeholder="Enter weight in Kg"
                  />
                  {errors.weight && <span className="error-text">{errors.weight}</span>}
                </div>
                <div className="form-group">
                  <label>Package Type</label>
                  <select className="input-field" value={formData.packageDetails.type} onChange={e => updateField('packageDetails', 'type', e.target.value, null)}>
                    <option value="DOCUMENT">Document</option>
                    <option value="PARCEL">Standard Parcel</option>
                    <option value="FRAGILE">Fragile Items</option>
                    <option value="ELECTRONICS">Electronics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pickup Date & Time</label>
                  <DatePicker
                    selected={formData.scheduledPickupTime ? new Date(formData.scheduledPickupTime) : null}
                    onChange={(date) => updateField(null, 'scheduledPickupTime', date ? date.toISOString() : '', 'pickupTime')}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`input-field ${errors.pickupTime ? 'error' : ''}`}
                    placeholderText="Select Date & Time"
                    minDate={new Date()}
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
                    <div className="price">₹{quote.totalAmount} <span>incl. tax</span></div>
                    <p className="delivery-days"><Calendar size={14}/> Expected in {quote.estimatedDays} days</p>
                    <div className="quote-tags">
                      <span>{formData.type}</span>
                      <span>Insured</span>
                      <span>Live Tracking</span>
                    </div>
                  </div>
                ) : (
                  <p className="quote-loading" style={{ color: '#64748b', fontSize: '13px' }}>Enter weight and destination to see live pricing...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h3>Review & Confirm</h3>
            <div className="review-container">
              <div className="review-card-group">
                <div className="review-card">
                  <h5>Shipment Route</h5>
                  <p><strong>From:</strong> {formData.pickupAddress.city} ({formData.pickupAddress.pincode})</p>
                  <p><strong>To:</strong> {formData.deliveryAddress.city} ({formData.deliveryAddress.pincode || formData.deliveryAddress.country})</p>
                </div>
                <div className="review-card">
                  <h5>Receiver Contact</h5>
                  <p><strong>Name:</strong> {formData.receiverName}</p>
                  <p><strong>Phone:</strong> {formData.receiverPhone}</p>
                </div>
              </div>

              <div className="pricing-breakdown">
                <div className="breakdown-header">Fare Breakdown</div>
                <div className="breakdown-item">
                  <span>Base Shipping Fee</span>
                  <span>₹{quote?.basePrice?.toFixed(2) || (formData.type === 'DOMESTIC' ? '100.00' : '1100.00')}</span>
                </div>
                <div className="breakdown-item">
                  <span>Weight Surcharge ({formData.packageDetails.weightKg}kg)</span>
                  <span>₹{(quote?.totalAmount - (quote?.basePrice || 0))?.toFixed(2) || (formData.packageDetails.weightKg * (formData.type === 'DOMESTIC' ? 50 : 550)).toFixed(2)}</span>
                </div>
                <div className="total-divider"></div>
                <div className="breakdown-item total">
                  <span>Total Amount</span>
                  <span>₹{quote?.totalAmount || (formData.type === 'DOMESTIC' ? (100 + formData.packageDetails.weightKg * 50) : (1100 + formData.packageDetails.weightKg * 550))}</span>
                </div>
                <div className="delivery-promise">
                  <Truck size={16} /> Estimated Delivery: {quote?.estimatedDays || '---'} Business Days
                </div>
                <div className="policy-disclaimer">
                  <ShieldCheck size={14} /> Coverage up to ₹5,000 included in basic plan.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="step-actions">
          {step > 1 ? (
            <button className="btn-outline" onClick={() => setStep(step - 1)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronLeft size={18} /> Back
              </div>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button className="btn-primary" onClick={handleNext}>
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><Loader2 className="spinner" size={18} /> Processing...</>
              ) : (
                <><Send size={18} /> Confirm & Book <ArrowRight size={18} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
