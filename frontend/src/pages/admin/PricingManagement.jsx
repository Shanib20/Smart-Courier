import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import axiosClient from '../../api/axiosClient';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Home, 
  ChevronRight, 
  Clock, 
  ChevronLeft,
  X,
  Loader2
} from 'lucide-react';
import './PricingManagement.css';
import usePageTitle from '../../hooks/usePageTitle';
import Pagination from '../../components/Pagination';

export default function PricingManagement() {
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formData, setFormData] = useState({
    fromPincodePrefix: '',
    toPincodePrefix: '',
    basePrice: '',
    ratePerKg: '',
    minWeightKg: '',
    estimatedDays: '',
    active: true
  });
  usePageTitle('Pricing Management');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/gateway/deliveries/pricing/rules');
      setRules(response.data || []);
    } catch (error) {
      addToast('Failed to load pricing rules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setFormData({ ...rule });
    } else {
      setEditingRuleId(null);
      setFormData({
        fromPincodePrefix: '', toPincodePrefix: '', basePrice: '',
        ratePerKg: '', minWeightKg: '', estimatedDays: '', active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRuleId) {
        await axiosClient.put(`/gateway/deliveries/pricing/rules/${editingRuleId}`, formData);
        addToast('Pricing rule synchronized.', 'success');
      } else {
        await axiosClient.post('/gateway/deliveries/pricing/rules', formData);
        addToast('New pricing tier established.', 'success');
      }
      setShowModal(false);
      fetchRules();
    } catch (error) {
      addToast('Failed to save protocol.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently purge this pricing rule?')) return;
    try {
      await axiosClient.delete(`/gateway/deliveries/pricing/rules/${id}`);
      addToast('Rule purged successfully.', 'success');
      fetchRules();
    } catch (error) {
      addToast('Deletion protocol failed.', 'error');
    }
  };

  const toggleActive = async (rule) => {
    try {
      await axiosClient.put(`/gateway/deliveries/pricing/rules/${rule.id}`, {
        ...rule,
        active: !rule.active
      });
      addToast('Rule status modified.', 'success');
      fetchRules();
    } catch (error) {
      addToast('Status update failed.', 'error');
    }
  };

  const filteredRules = rules.filter(r => 
    r.fromPincodePrefix.includes(searchQuery) || 
    r.toPincodePrefix.includes(searchQuery)
  );

  return (
    <div className="pricing-management-container slide-up">
      <div className="pm-header">
        <div>
          <div className="breadcrumb-premium">
            <Home size={14} />
            <span className="tag">Dashboard</span>
            <ChevronRight size={14} />
            <span className="tag active">Pricing Management</span>
          </div>
          <h1>Pricing Management</h1>
          <p className="subtitle">Configure regional logistic rates and service level agreements for the global carrier network.</p>
        </div>
        <button className="btn-add-rule" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add New Rule
        </button>
      </div>

      <div className="pricing-card-premium">
        <div className="card-header-premium">
          <h3>
            Active Pricing Tiers 
            <span className="rule-count-badge">{rules.length} Rules Active</span>
          </h3>
          <div className="card-actions-premium">
            <div className="search-premium">
              <Search size={16} className="icon" />
              <input 
                type="text" 
                placeholder="Search by pincode prefix..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn-premium">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th>From (Prefix)</th>
                <th>To (Prefix)</th>
                <th>Base Price (₹)</th>
                <th>Rate/Kg (₹)</th>
                <th>Min Wgt (Kg)</th>
                <th>Est. Days</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#0051d5' }} /></td></tr>
              ) : filteredRules.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>No pricing tiers defined for the current selection.</td></tr>
              ) : (
                filteredRules.map(r => (
                  <tr key={r.id}>
                    <td className="pincode-text">{r.fromPincodePrefix}</td>
                    <td className="pincode-text">{r.toPincodePrefix}</td>
                    <td className="price-text">₹{(r.basePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="price-text">₹{(r.ratePerKg || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{r.minWeightKg}kg</td>
                    <td>
                      <div className="est-days">
                        <Clock size={14} />
                        <span>{r.estimatedDays} Days</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleActive(r)}
                        className={r.active ? 'status-pill-emerald' : 'status-pill-slate'}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <span className={`dot-indicator ${r.active ? 'emerald' : 'slate'}`}></span>
                        {r.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns-premium">
                        <button className="icon-btn-premium" onClick={() => handleOpenModal(r)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn-premium delete" onClick={() => handleDelete(r.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={0} 
          totalPages={3} 
          totalElements={rules.length} 
          onPageChange={() => {}} 
          pageSize={10}
        />
      </div>

      <footer className="pm-footer">
        <div>© 2024 SmartCourier Logistics Infrastructure. All rights reserved.</div>
        <div className="pm-footer-links">
          <a href="#">API Docs</a>
          <a href="#">Global Network Status</a>
          <a href="#">Security Manifest</a>
        </div>
      </footer>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-premium" style={{ maxWidth: '600px' }}>
            <div className="modal-header-premium">
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{editingRuleId ? 'Synchronize Pricing Protocol' : 'Establish New Pricing Tier'}</h2>
              <button onClick={() => setShowModal(false)} className="icon-btn-premium"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-premium" style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="input-label-premium">From Prefix (Origin)</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.fromPincodePrefix} 
                      onChange={e=>setFormData({...formData, fromPincodePrefix: e.target.value})} 
                      required 
                      placeholder="e.g. 110"
                    />
                  </div>
                  <div>
                    <label className="input-label-premium">To Prefix (Destination)</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.toPincodePrefix} 
                      onChange={e=>setFormData({...formData, toPincodePrefix: e.target.value})} 
                      required 
                      placeholder="e.g. 400"
                    />
                  </div>
                  <div>
                    <label className="input-label-premium">Base Rate (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.basePrice} 
                      onChange={e=>setFormData({...formData, basePrice: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="input-label-premium">Rate per Kg (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.ratePerKg} 
                      onChange={e=>setFormData({...formData, ratePerKg: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="input-label-premium">Threshold Weight (Kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.minWeightKg} 
                      onChange={e=>setFormData({...formData, minWeightKg: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="input-label-premium">Est. Transit (Days)</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      value={formData.estimatedDays} 
                      onChange={e=>setFormData({...formData, estimatedDays: e.target.value})} 
                      required 
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.active} 
                        onChange={e=>setFormData({...formData, active: e.target.checked})} 
                        style={{ width: '16px', height: '16px', accentColor: '#0051d5' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Activate Rule on Synchronization</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" className="btn-add-rule" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }} onClick={() => setShowModal(false)}>Abort</button>
                <button type="submit" className="btn-add-rule">Synchronize Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
