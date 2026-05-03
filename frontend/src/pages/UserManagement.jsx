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
  Calendar
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './UserManagement.css';

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
      <div className="modal-content activity-modal">
        <div className="modal-header">
          <h2>User Intelligence</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>
        <div className="modal-body">
          <div className="user-info-summary">
            <div className="avatar-large">{user.name.charAt(0)}</div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p className="email"><Mail size={14}/> {user.email}</p>
              <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                {user.status}
              </span>
            </div>
          </div>

          <div className="activity-grid">
            <div className="activity-item">
              <div className="icon-bg blue"><Package size={20}/></div>
              <div className="stat">
                <span className="label">Total Bookings</span>
                <span className="value">{loading ? '...' : activity?.totalBookings}</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="icon-bg orange"><Clock size={20}/></div>
              <div className="stat">
                <span className="label">Active Deliveries</span>
                <span className="value">{loading ? '...' : activity?.activeBookings}</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="icon-bg green"><Calendar size={20}/></div>
              <div className="stat">
                <span className="label">Last Activity</span>
                <span className="value">
                  {loading ? '...' : activity?.lastBookingDate ? new Date(activity.lastBookingDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
            <div className="activity-item">
              <div className="icon-bg purple"><Shield size={20}/></div>
              <div className="stat">
                <span className="label">Member Since</span>
                <span className="value">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close Insight</button>
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
      addToast('Invitation sent successfully!', 'success');
      onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Invite New Administrator</h2>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="subtitle">Invite someone to join the SwiftCourier admin team. They will receive a temporary password via email.</p>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@smartcourier.com"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('CUSTOMER');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authApi.getUsers(page, 10, roleFilter);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      addToast('Failed to load user records', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = async (user) => {
    if (user.id === currentUser?.id) {
      addToast('You cannot suspend yourself', 'warning');
      return;
    }
    try {
      await authApi.toggleSuspend(user.id);
      addToast(`User ${user.status === 'ACTIVE' ? 'suspended' : 'activated'} successfully`, 'success');
      fetchUsers();
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      addToast('You cannot delete your own account', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action is permanent.`)) return;
    
    try {
      await authApi.deleteUser(user.id);
      addToast('User deleted from records', 'success');
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Deletion failed';
      addToast(message, 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-management-container slide-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User Management</h1>
          <p className="subtitle">Manage customer access and monitor account activity.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsInviteOpen(true)}>
          <UserPlus size={20} /> Invite Admin
        </button>
      </div>

      <div className="management-controls">
        <div className="tab-switcher">
          <button className={roleFilter === 'CUSTOMER' ? 'active' : ''} onClick={() => {setRoleFilter('CUSTOMER'); setPage(0);}}>Customers</button>
          <button className={roleFilter === 'ADMIN' ? 'active' : ''} onClick={() => {setRoleFilter('ADMIN'); setPage(0);}}>Admins</button>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan="5"><div className="skeleton"></div></td>
                </tr>
              ))
            ) : filteredUsers.map(user => (
              <tr key={user.id} className={user.status === 'SUSPENDED' ? 'row-suspended' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">{user.name.charAt(0)}</div>
                    <div>
                      <div className="name">{user.name} {user.id === currentUser?.id && <small className="self-tag">(You)</small>}</div>
                      <div className="email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {user.role === 'CUSTOMER' && (
                      <button className="btn-icon view" onClick={() => setSelectedUser(user)} title="View Insight">
                        <Eye size={18} />
                      </button>
                    )}
                    <button 
                      className={`btn-icon ${user.status === 'ACTIVE' ? 'suspend' : 'activate'}`} 
                      onClick={() => handleToggleSuspend(user)}
                      title={user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      disabled={user.id === currentUser?.id}
                    >
                      {user.status === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                    <button 
                      className="btn-icon delete" 
                      onClick={() => handleDelete(user)}
                      title="Delete User"
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={18} /> Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next <ChevronRight size={18} />
          </button>
        </div>
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
    </div>
  );
}
