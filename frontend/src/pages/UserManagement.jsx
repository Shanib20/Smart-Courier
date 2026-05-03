import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  UserX, 
  UserCheck, 
  Trash2, 
  Shield, 
  Clock, 
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Calendar,
  MoreHorizontal,
  MapPin,
  Lock,
  Database,
  Key,
  ShieldAlert,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './UserManagement.css';
import usePageTitle from '../hooks/usePageTitle';
import Pagination from '../components/Pagination';

const UserActivityModal = ({ user, onClose }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await authApi.getUserActivity(user.id);
        setActivity(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [user.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content-premium" style={{ maxWidth: '600px' }}>
        <div className="modal-header-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ background: '#eff6ff', color: '#0051d5', padding: '8px', borderRadius: '8px' }}>
                <Shield size={20} />
             </div>
             <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>User Intelligence Insight</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Deep operational analytics for security audit</p>
             </div>
          </div>
          <button onClick={onClose} className="um-icon-btn"><X size={20} /></button>
        </div>
        <div className="modal-body-premium" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="avatar-um" style={{ width: '56px', height: '56px', fontSize: '20px' }}>{(user?.name || 'U').charAt(0)}</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>{user?.name}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14}/> {user?.email}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
               <span className={`status-pill-premium ${(user?.status || '').toLowerCase()}`}>
                  <span className={`dot-indicator ${(user?.status || '').toLowerCase()}`}></span>
                  {user?.status}
               </span>
            </div>
          </div>

          <div className="um-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div className="um-kpi-card" style={{ padding: '16px' }}>
              <span className="label">Total Bookings</span>
              <span className="value" style={{ fontSize: '24px' }}>{loading ? '...' : activity?.totalBookings || 0}</span>
              <span className="trend positive" style={{ fontSize: '11px' }}>Lifetime activity</span>
            </div>
            <div className="um-kpi-card" style={{ padding: '16px' }}>
              <span className="label">Active Deliveries</span>
              <span className="value" style={{ fontSize: '24px' }}>{loading ? '...' : activity?.activeBookings || 0}</span>
              <span className="trend" style={{ fontSize: '11px', color: '#64748b' }}>Currently in transit</span>
            </div>
            <div className="um-kpi-card" style={{ padding: '16px' }}>
              <span className="label">Last Activity</span>
              <span className="value" style={{ fontSize: '18px', marginTop: '4px' }}>
                {loading ? '...' : activity?.lastBookingDate ? new Date(activity.lastBookingDate).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div className="um-kpi-card" style={{ padding: '16px' }}>
              <span className="label">Member Since</span>
              <span className="value" style={{ fontSize: '18px', marginTop: '4px' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} className="btn-invite" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}>Close Record</button>
        </div>
      </div>
    </div>
  );
};

const InviteAdminModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.inviteAdmin({ email, name });
      addToast('System invitation dispatched.', 'success');
      onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Protocol failure', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-premium" style={{ maxWidth: '480px' }}>
        <div className="modal-header-premium">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Dispatch Admin Invitation</h2>
          <button onClick={onClose} className="um-icon-btn"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-premium" style={{ padding: '24px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
              Grant administrative access to a new operative. A secure temporary credential will be transmitted to their verified terminal.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Operative Name</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Alexander Sterling"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Terminal Email</label>
              <input 
                type="email" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="operative@smartcourier.com"
              />
            </div>
          </div>
          <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose} className="btn-invite" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}>Abort</button>
            <button type="submit" className="btn-invite" disabled={loading}>
              {loading ? 'Transmitting...' : 'Dispatch Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose, confirmText = "Confirm", isDangerous = false }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content-premium" style={{ maxWidth: '400px' }}>
        <div className="modal-header-premium">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} className="um-icon-btn"><X size={20} /></button>
        </div>
        <div className="modal-body-premium" style={{ padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{message}</p>
        </div>
        <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} className="btn-invite" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}>Cancel</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="btn-invite" 
            style={isDangerous ? { background: '#ef4444', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' } : {}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState('CUSTOMER');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ open: false, title: '', message: '', onConfirm: () => {}, isDangerous: false });
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  usePageTitle('User Management');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authApi.getUsers(page, 10, roleFilter);
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      addToast('Database connection failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = (user) => {
    if (user.id === currentUser?.id) return;
    setConfirmConfig({
      open: true,
      title: 'Update Access Status',
      message: `Are you sure you want to ${user.status === 'ACTIVE' ? 'suspend' : 'activate'} access for ${user.name}?`,
      confirmText: user.status === 'ACTIVE' ? 'Suspend Access' : 'Restore Access',
      isDangerous: user.status === 'ACTIVE',
      onConfirm: async () => {
        try {
          await authApi.toggleSuspend(user.id);
          addToast(`User ${user.status === 'ACTIVE' ? 'suspended' : 'activated'}`, 'success');
          fetchUsers();
        } catch (err) {
          addToast('Status update failed', 'error');
        }
      }
    });
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) return;
    setConfirmConfig({
      open: true,
      title: 'Purge Identity',
      message: `Permanently remove ${user.name} from global records? This action is irreversible and will delete all associated data.`,
      confirmText: 'Purge Identity',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await authApi.deleteUser(user.id);
          addToast('Identity purged from records', 'success');
          fetchUsers();
        } catch (err) {
          addToast(err.response?.data?.message || 'Purge failed', 'error');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-management-container slide-up">
      <div className="um-header">
        <div>
          <h1>User Management</h1>
          <p className="subtitle">Manage system access and monitor account activity across the platform.</p>
        </div>
        <button className="btn-invite" onClick={() => setIsInviteOpen(true)}>
          <UserPlus size={18} /> Invite New User
        </button>
      </div>

      <div className="um-controls">
        <div className="um-tabs">
          <button className={`um-tab ${roleFilter === 'CUSTOMER' ? 'active' : ''}`} onClick={() => {setRoleFilter('CUSTOMER'); setPage(0);}}>Customers</button>
          <button className={`um-tab ${roleFilter === 'ADMIN' ? 'active' : ''}`} onClick={() => {setRoleFilter('ADMIN'); setPage(0);}}>Admins</button>
        </div>
        <div className="um-search-group">
          <div className="um-search">
             <Search size={16} className="icon" />
             <input 
               type="text" 
               placeholder="Search name or email..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: '#0051d5' }}/></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>No identities found in current cluster.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-profile-cell">
                    <div className="avatar-um">{(user?.name || 'U').charAt(0)}</div>
                    <div className="user-meta">
                       <div className="name">{user?.name} {user?.id === currentUser?.id && <small style={{ color: '#0051d5', fontWeight: 800 }}>(You)</small>}</div>
                       <div className="email">{user?.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                   <span className={`role-pill ${(user?.role || '').toLowerCase()}`}>
                      {user?.role}
                   </span>
                </td>
                <td>
                  <span className="status-dot-pill">
                    <span className={`dot-indicator ${(user?.status || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'banned'}`}></span>
                    {user?.status || 'ACTIVE'}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontWeight: 600 }}>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    : 'Legacy Account'}
                </td>
                <td>
                  <div className="action-row-premium">
                    {user.role === 'CUSTOMER' && (
                      <button className="um-icon-btn" onClick={() => setSelectedUser(user)} title="View Insight">
                        <Eye size={16} />
                      </button>
                    )}
                    <button 
                      className="um-icon-btn" 
                      onClick={() => handleToggleSuspend(user)}
                      title={user.status === 'ACTIVE' ? 'Suspend Access' : 'Restore Access'}
                      disabled={user.id === currentUser?.id}
                    >
                      {user.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button 
                      className="um-icon-btn" 
                      style={{ color: '#ef4444' }}
                      onClick={() => handleDelete(user)}
                      title="Purge Identity"
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      {selectedUser && (
        <UserActivityModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {isInviteOpen && (
        <InviteAdminModal 
          onClose={() => setIsInviteOpen(false)} 
          onSuccess={() => {
            setIsInviteOpen(false);
            fetchUsers();
          }} 
        />
      )}

      <ConfirmModal 
        isOpen={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDangerous={confirmConfig.isDangerous}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, open: false })}
      />
    </div>
  );
}
