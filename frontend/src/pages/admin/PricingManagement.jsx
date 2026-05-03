import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import axiosClient from '../../api/axiosClient';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import '../AdminDashboard.css';

export default function PricingManagement() {
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
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

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axiosClient.get('/gateway/deliveries/pricing/rules');
      setRules(response.data);
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
        addToast('Rule updated successfully', 'success');
      } else {
        await axiosClient.post('/gateway/deliveries/pricing/rules', formData);
        addToast('Rule created successfully', 'success');
      }
      setShowModal(false);
      fetchRules();
    } catch (error) {
      addToast('Failed to save rule', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pricing rule?')) return;
    try {
      await axiosClient.delete(`/gateway/deliveries/pricing/rules/${id}`);
      addToast('Rule deleted', 'success');
      fetchRules();
    } catch (error) {
      addToast('Failed to delete rule', 'error');
    }
  };

  const toggleActive = async (rule) => {
    try {
      await axiosClient.put(`/gateway/deliveries/pricing/rules/${rule.id}`, {
        ...rule,
        active: !rule.active
      });
      addToast('Rule status updated', 'success');
      fetchRules();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="loading-state">Loading pricing rules...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Pricing Management</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
          <Plus size={18} /> Add New Rule
        </button>
      </div>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>From (Prefix)</th>
                <th>To (Prefix)</th>
                <th>Base Price (₹)</th>
                <th>Rate/Kg (₹)</th>
                <th>Min Wgt (Kg)</th>
                <th>Est. Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign:'center'}}>No pricing rules found. System will use global fallback.</td></tr>
              ) : (
                rules.map(r => (
                  <tr key={r.id}>
                    <td>{r.fromPincodePrefix}</td>
                    <td>{r.toPincodePrefix}</td>
                    <td>₹{r.basePrice}</td>
                    <td>₹{r.ratePerKg}</td>
                    <td>{r.minWeightKg}kg</td>
                    <td>{r.estimatedDays} days</td>
                    <td>
                      <button 
                        onClick={() => toggleActive(r)}
                        className={`status-badge ${r.active ? 'completed' : 'cancelled'}`}
                        style={{border:'none', cursor:'pointer'}}
                      >
                        {r.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button className="btn-icon" onClick={() => handleOpenModal(r)}><Edit2 size={16} /></button>
                        <button className="btn-icon" style={{color:'#ef4444'}} onClick={() => handleDelete(r.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <h2>{editingRuleId ? 'Edit Pricing Rule' : 'New Pricing Rule'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
                <div className="form-group">
                  <label>From Pincode Prefix (3-6 digits)</label>
                  <input type="text" className="input-field" value={formData.fromPincodePrefix} onChange={e=>setFormData({...formData, fromPincodePrefix: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>To Pincode Prefix (3-6 digits)</label>
                  <input type="text" className="input-field" value={formData.toPincodePrefix} onChange={e=>setFormData({...formData, toPincodePrefix: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Base Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.basePrice} onChange={e=>setFormData({...formData, basePrice: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Rate per extra Kg (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.ratePerKg} onChange={e=>setFormData({...formData, ratePerKg: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Minimum Weight (Kg)</label>
                  <input type="number" step="0.1" className="input-field" value={formData.minWeightKg} onChange={e=>setFormData({...formData, minWeightKg: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Estimated Days</label>
                  <input type="number" className="input-field" value={formData.estimatedDays} onChange={e=>setFormData({...formData, estimatedDays: e.target.value})} required />
                </div>
                <div className="form-group" style={{gridColumn:'1 / -1'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                    <input type="checkbox" checked={formData.active} onChange={e=>setFormData({...formData, active: e.target.checked})} />
                    Rule is Active
                  </label>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
