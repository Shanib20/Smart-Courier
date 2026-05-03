import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { profileApi } from '../api/profileApi';
import { User, Lock, Shield, MapPin, Camera, Trash2, Edit2, Plus, Star } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'addresses'
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    twoFactorEnabled: false,
    profilePhoto: '',
    addresses: []
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home',
    default: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfileData(data);
    } catch (error) {
      addToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await profileApi.updateProfile({ name: profileData.name });
      addToast('Profile updated successfully!', 'success');
      if (user) {
        login({ ...user, name: profileData.name }); 
      }
    } catch (error) {
      addToast('Failed to update profile.', 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return addToast('New passwords do not match.', 'error');
    }
    try {
      await profileApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      addToast('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update password.', 'error');
    }
  };

  const toggle2FA = async () => {
    const newStatus = !profileData.twoFactorEnabled;
    try {
      await profileApi.toggle2FA(newStatus);
      setProfileData({ ...profileData, twoFactorEnabled: newStatus });
      addToast(`Two-Factor Authentication ${newStatus ? 'enabled' : 'disabled'}.`, 'success');
    } catch (error) {
      addToast('Failed to update 2FA settings.', 'error');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return addToast('Image must be less than 2MB', 'error');
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        await profileApi.updateProfilePhoto(base64String);
        setProfileData({ ...profileData, profilePhoto: base64String });
        addToast('Profile photo updated successfully!', 'success');
      } catch (error) {
        addToast('Failed to upload photo.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Address Handlers
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await profileApi.updateAddress(editingAddressId, addressForm);
        addToast('Address updated successfully!', 'success');
      } else {
        await profileApi.addAddress(addressForm);
        addToast('Address added successfully!', 'success');
      }
      setShowAddressModal(false);
      fetchProfile();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await profileApi.deleteAddress(id);
      addToast('Address deleted successfully!', 'success');
      fetchProfile();
    } catch (error) {
      addToast('Failed to delete address.', 'error');
    }
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: '', phone: '', line1: '', line2: '',
      city: '', state: '', pincode: '', label: 'Home', default: false
    });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({ ...addr });
    setShowAddressModal(true);
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <div className="profile-avatar-container">
          <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
            {profileData.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                <User size={48} />
              </div>
            )}
            <div className="avatar-overlay">
              <Camera size={24} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="profile-title-info">
            <h1 className="page-title">{profileData.name}</h1>
            <span className="user-role-badge large">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={18} /> Personal Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          <MapPin size={18} /> Address Book
        </button>
      </div>
      
      {activeTab === 'personal' && (
        <div className="profile-grid">
          <div className="profile-card">
            <div className="card-header">
              <User size={20} className="var-accent" />
              <h2>Personal Information</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="input-field" value={profileData.email} disabled />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <Lock size={20} className="var-accent" />
              <h2>Change Password</h2>
            </div>
            <form onSubmit={handlePasswordUpdate} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>

          <div className="profile-card two-fa-card">
            <div className="card-header">
              <Shield size={20} className="var-accent" />
              <h2>Two-Factor Authentication</h2>
            </div>
            <div className="two-fa-content">
              <p>Add an extra layer of security to your account.</p>
              <div className="toggle-wrapper">
                <span>Status: <strong>{profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong></span>
                <button 
                  className={`btn ${profileData.twoFactorEnabled ? 'btn-danger' : 'btn-primary'}`} 
                  onClick={toggle2FA}
                >
                  {profileData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <Star size={20} className="var-accent" />
              <h2>Notification Preferences</h2>
            </div>
            <div className="two-fa-content">
              <p>Stay updated with shipment status alerts.</p>
              <div className="toggle-wrapper" style={{ justifyContent: 'space-between' }}>
                <span>Email Notifications</span>
                <input type="checkbox" className="toggle-input" defaultChecked />
              </div>
            </div>
          </div>

          <div className="profile-card danger-zone">
            <div className="card-header">
              <Trash2 size={20} style={{ color: 'var(--danger)' }} />
              <h2 style={{ color: 'var(--danger)' }}>Danger Zone</h2>
            </div>
            <div className="two-fa-content">
              <p>Permanently delete your account and all data.</p>
              <button 
                className="btn btn-danger" 
                onClick={async () => {
                  const pass = prompt('For security, please enter your password to confirm deletion:');
                  if (pass) {
                    if (window.confirm('Are you absolutely sure? This cannot be undone.')) {
                      try {
                        await profileApi.deleteAccount(pass);
                        addToast('Account deleted successfully.', 'success');
                        window.location.href = '/login';
                      } catch (err) {
                        addToast('Incorrect password or error occurred.', 'error');
                      }
                    }
                  }
                }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="address-book-section">
          <div className="address-header-row">
            <h2>Saved Addresses</h2>
            <button className="btn btn-primary flex-center gap-2" onClick={openAddAddress}>
              <Plus size={18} /> Add New Address
            </button>
          </div>
          
          <div className="addresses-grid">
            {profileData.addresses.length === 0 ? (
              <div className="empty-state">
                <MapPin size={48} />
                <p>No addresses saved yet.</p>
              </div>
            ) : (
              profileData.addresses.map(addr => (
                <div key={addr.id} className={`address-card ${addr.default ? 'is-default' : ''}`}>
                  {addr.default && <div className="default-badge"><Star size={12} /> Default</div>}
                  <div className="address-label">{addr.label}</div>
                  <h3>{addr.fullName}</h3>
                  <p className="address-phone">{addr.phone}</p>
                  <p className="address-lines">
                    {addr.line1}<br/>
                    {addr.line2 && <>{addr.line2}<br/></>}
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <div className="address-actions">
                    <button className="btn-icon" onClick={() => openEditAddress(addr)}><Edit2 size={18} /></button>
                    <button className="btn-icon delete" onClick={() => handleDeleteAddress(addr.id)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content address-modal">
            <h2>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleAddressSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone Number (10 digits)</label>
                  <input type="text" className="input-field" pattern="\d{10}" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address Line 1</label>
                <input type="text" className="input-field" value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address Line 2 (Optional)</label>
                <input type="text" className="input-field" value={addressForm.line2} onChange={e => setAddressForm({...addressForm, line2: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="input-field" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="input-field" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Pincode (6 digits)</label>
                  <input type="text" className="input-field" pattern="\d{6}" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Label</label>
                  <select className="input-field" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group checkbox-group mt-4">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={addressForm.default} onChange={e => setAddressForm({...addressForm, default: e.target.checked})} />
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
