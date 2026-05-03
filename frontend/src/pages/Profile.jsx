import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { profileApi } from '../api/profileApi';
import { User, Lock, Shield, MapPin, Camera, Trash2, Edit2, Plus, CheckCircle, Home, Briefcase, Bell, AlertTriangle } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import './Profile.css';

export default function Profile() {
  usePageTitle('User Profile');
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    twoFactorEnabled: false,
    profilePhoto: '',
    addresses: [],
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    browserNotificationsEnabled: true
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

  const handleNotificationToggle = async (key, value) => {
    try {
      const fieldMap = {
        email: 'emailNotificationsEnabled',
        sms: 'smsNotificationsEnabled',
        browser: 'browserNotificationsEnabled'
      };
      
      // Update local state first for responsiveness
      setProfileData(prev => ({ ...prev, [fieldMap[key]]: value }));
      
      await profileApi.updateNotifications({ [key]: value });
      addToast('Notification settings updated.', 'success');
    } catch (error) {
      addToast('Failed to update notification settings.', 'error');
      fetchProfile(); // Revert from server
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
        if (user) {
          login({ ...user, profilePhoto: base64String });
        }
        addToast('Profile photo updated successfully!', 'success');
      } catch (error) {
        addToast('Failed to upload photo.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleDeleteAccount = async () => {
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
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-max-width">
        
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-rel" onClick={() => fileInputRef.current?.click()}>
            {profileData.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" className="profile-avatar-main" />
            ) : (
              <div className="profile-avatar-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                <User size={40} color="#64748b" />
              </div>
            )}
            <div className="avatar-edit-btn">
              <Camera size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handlePhotoUpload}
            />
          </div>
          
          <div className="profile-header-info">
            <div className="profile-name-badge">
              <h1>{profileData.name}</h1>
              <span className="role-tag">
                <CheckCircle size={14} style={{ marginRight: '4px' }} />
                {user?.role || 'Member'}
              </span>
            </div>
            <p className="profile-subtext">Global Logistics Account Specialist</p>
          </div>

          <div className="header-actions">
            <button className="btn-solid" onClick={handleProfileUpdate}>Save Changes</button>
          </div>
        </div>

        {/* Main Settings Grid */}
        <div className="settings-grid">
          
          {/* Left Column: Personal & Addresses */}
          <div className="settings-main">
            
            {/* Personal Information */}
            <div className="settings-card">
              <div className="card-top">
                <div className="card-top-title">
                  <User size={20} className="card-top-icon" />
                  <h3>Personal Information</h3>
                </div>
                <span className="card-badge">Required</span>
              </div>
              <div className="card-body">
                <form className="form-grid" onSubmit={handleProfileUpdate}>
                  <div className="input-wrap">
                    <label className="input-label">Full Name</label>
                    <input 
                      type="text" 
                      className="styled-input" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="styled-input" value={profileData.email} readOnly />
                  </div>
                </form>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="settings-card">
              <div className="card-top">
                <div className="card-top-title">
                  <MapPin size={20} className="card-top-icon" />
                  <h3>Saved Addresses</h3>
                </div>
                <button className="btn-ghost" style={{ padding: '4px 12px', color: '#0051d5', borderColor: 'transparent' }} onClick={openAddAddress}>
                  <Plus size={14} style={{ marginRight: '4px' }} />
                  Add New Address
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profileData.addresses.length === 0 ? (
                  <p className="profile-subtext" style={{ textAlign: 'center', padding: '24px' }}>No addresses saved yet.</p>
                ) : (
                  profileData.addresses.map(addr => (
                    <div key={addr.id} className="address-item">
                      <div className="address-icon-box">
                        {addr.label === 'Work' ? <Briefcase size={20} /> : <Home size={20} />}
                      </div>
                      <div className="address-content">
                        <div className="address-top-flex">
                          <span className="address-name">{addr.label}</span>
                          {addr.default && <span className="default-tag">Default</span>}
                        </div>
                        <p className="address-text">
                          <strong>{addr.fullName}</strong> • {addr.phone}<br/>
                          {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <div className="address-actions-inline">
                        <button className="action-icon-btn" onClick={() => openEditAddress(addr)}><Edit2 size={16} /></button>
                        <button className="action-icon-btn delete" onClick={() => handleDeleteAddress(addr.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Security & Notifications */}
          <div className="settings-side">
            
            {/* Security */}
            <div className="settings-card">
              <div className="card-top">
                <div className="card-top-title">
                  <Lock size={20} className="card-top-icon" />
                  <h3>Security</h3>
                </div>
              </div>
              <div className="card-body">
                <form className="security-form-compact" onSubmit={handlePasswordUpdate}>
                  <div className="input-wrap">
                    <input 
                      type="password" 
                      className="styled-input" 
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-wrap">
                    <input 
                      type="password" 
                      className="styled-input" 
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-wrap">
                    <input 
                      type="password" 
                      className="styled-input" 
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-update-pass">Update Password</button>
                </form>

                <div className="toggle-item" style={{ marginTop: '16px' }}>
                  <div className="toggle-label-wrap">
                    <span className="toggle-main-label">Two-Factor (2FA)</span>
                    <span className="toggle-sub-label" style={{ color: profileData.twoFactorEnabled ? '#059669' : '#94a3b8' }}>
                      {profileData.twoFactorEnabled ? 'Currently Active' : 'Inactive'}
                    </span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={profileData.twoFactorEnabled} onChange={toggle2FA} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-card">
              <div className="card-top">
                <div className="card-top-title">
                  <Bell size={20} className="card-top-icon" />
                  <h3>Notifications</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="toggle-item">
                  <span className="toggle-main-label">Email Alerts</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profileData.emailNotificationsEnabled} 
                      onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span className="toggle-main-label">SMS Notifications</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profileData.smsNotificationsEnabled} 
                      onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span className="toggle-main-label">Browser Push</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profileData.browserNotificationsEnabled} 
                      onChange={(e) => handleNotificationToggle('browser', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-card danger-card">
              <div className="card-top danger-top">
                <div className="card-top-title">
                  <AlertTriangle size={20} className="card-top-icon" style={{ color: '#b91c1c' }} />
                  <h3>Danger Zone</h3>
                </div>
              </div>
              <div className="card-body">
                <p className="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn-delete-account" onClick={handleDeleteAccount}>Delete Account</button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Banner */}
        <div className="profile-footer-banner">
          <img src="/images/logistics_hero_bg.png" alt="Logistics Infrastructure" className="footer-banner-img" />
          <div className="footer-banner-overlay">
            <h4>Global Precision Infrastructure</h4>
            <p>Your premium membership grants you priority routing and 24/7 concierge support across our entire worldwide network.</p>
          </div>
        </div>

      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content-premium">
            <div className="modal-header">
              <h2>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
            </div>
            <form onSubmit={handleAddressSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="input-wrap">
                    <label className="input-label">Full Name</label>
                    <input type="text" className="styled-input" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} required />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Phone Number (10 digits)</label>
                    <input type="text" className="styled-input" pattern="\d{10}" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} required />
                  </div>
                  <div className="input-wrap full-width">
                    <label className="input-label">Address Line 1</label>
                    <input type="text" className="styled-input" value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} required />
                  </div>
                  <div className="input-wrap full-width">
                    <label className="input-label">Address Line 2 (Optional)</label>
                    <input type="text" className="styled-input" value={addressForm.line2} onChange={e => setAddressForm({...addressForm, line2: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">City</label>
                    <input type="text" className="styled-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">State</label>
                    <input type="text" className="styled-input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} required />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Pincode (6 digits)</label>
                    <input type="text" className="styled-input" pattern="\d{6}" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} required />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Label</label>
                    <select className="styled-input" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="full-width">
                    <label className="checkbox-wrap-premium">
                      <input type="checkbox" checked={addressForm.default} onChange={e => setAddressForm({...addressForm, default: e.target.checked})} />
                      <span>Set as default address</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn-solid">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
