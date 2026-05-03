import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../api/authApi';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import '../AdminDashboard.css';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await authApi.getAdmins();
      setAdmins(data);
    } catch (error) {
      addToast('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.createAdmin({ name, email });
      addToast('Admin created successfully! Welcome email sent.', 'success');
      setName('');
      setEmail('');
      fetchAdmins();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create admin.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await authApi.deleteAdmin(id);
      addToast('Admin removed successfully', 'success');
      fetchAdmins();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete admin', 'error');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Manage Admins</h1>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <h2><UserPlus size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Invite New Admin</h2>
          <form onSubmit={handleCreateAdmin} className="admin-form" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="name">Full Name</label>
              <input 
                id="name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Admin Name"
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Invite...' : 'Create Admin'}
            </button>
          </form>
        </div>

        <div className="admin-card" style={{ marginTop: '2rem' }}>
          <h2><Shield size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Current Administrators</h2>
          {loading ? (
            <p>Loading admins...</p>
          ) : (
            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`status-badge ${admin.verified ? 'status-active' : 'status-pending'}`}>
                          {admin.verified ? 'Active' : 'Pending Verification'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Remove Admin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No admins found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
