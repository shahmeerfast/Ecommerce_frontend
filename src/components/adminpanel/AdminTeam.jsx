import React, { useEffect, useState, useRef } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const modalBackdropStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle = {
  background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 16px #0003', position: 'relative'
};

const AdminTeam = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', profileImage: '' });
  const [showForm, setShowForm] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const historyContentRef = useRef(null);
  const token = localStorage.getItem('token');

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/user/users', { headers: { token } });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update user
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/user/admin/${editingUser._id}`, form, { headers: { token } });
        toast.success('User updated');
      } else {
        await axios.post('/api/user/add', form, { headers: { token } });
        toast.success('User added');
      }
      setShowForm(false);
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'user', profileImage: '' });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to save user');
    }
  };

  // Edit user
  const handleEdit = user => {
    setEditingUser(user);
    setForm({ name: user.name || user.fullName || '', email: user.email, password: '', role: user.role || 'user', profileImage: user.profileImage || '' });
    setShowForm(true);
  };

  // Delete user
  const handleDelete = async user => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/user/admin/${user._id}`, { headers: { token } });
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Fetch user history (orders only)
  const openHistoryModal = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    setHistoryError(null);
    setUserOrders([]);
    setUserMessages([]);
    try {
      const res = await axios.get(`/api/user/admin/history/${user._id}`, { headers: { token } });
      if (res.data.success) {
        setUserOrders(res.data.orders || []);
        // setUserMessages(res.data.messages || []); // Don't show messages
      } else {
        setHistoryError('Failed to load user history.');
      }
    } catch (err) {
      setHistoryError('Failed to load user history.');
    } finally {
      setHistoryLoading(false);
    }
  };
  const closeHistoryModal = () => setHistoryUser(null);

  return (
    <div className="admin-team-root" style={{ padding: 32, minHeight: '80vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Team <span style={{ fontWeight: 400, fontSize: 18, color: '#888' }}>(Users)</span></div>
        <div className="admin-team-table-container" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 32 }}>Loading...</div> : (
            <table className="admin-team-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 12px' }}>{user.name || user.fullName}</td>
                    <td style={{ padding: '14px 12px' }}>{user.email}</td>
                    <td style={{ padding: '14px 12px' }}>{user.phone || '-'}</td>
                    <td style={{ padding: '14px 12px', textTransform: 'capitalize' }}>
                      <span style={{
                        color: (user.status || 'Active') === 'Active' ? '#3C91E6' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{new Date(user.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button
                        className="admin-user-edit-btn"
                        style={{
                          background: '#3C91E6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 18px',
                          marginRight: 8,
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                        onMouseOut={e => e.currentTarget.style.background = '#3C91E6'}
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-user-delete-btn"
                        style={{
                          background: '#e53e3e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 18px',
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                        onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </button>
                      <button
                        className="admin-user-history-btn"
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 18px',
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#059669'}
                        onMouseOut={e => e.currentTarget.style.background = '#10b981'}
                        onClick={() => openHistoryModal(user)}
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showForm && (
        <div style={modalBackdropStyle} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <form className="admin-user-modal" onSubmit={handleSubmit} style={{
            background: document.body.classList.contains('navy-dark') ? '#232e3c' : '#fff',
            borderRadius: 16,
            padding: 32,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 2px 16px #0003',
            position: 'relative',
            zIndex: 10000
          }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{editingUser ? 'Edit User' : 'Add User'}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input name="email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            {!editingUser && <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input name="password" value={form.password} onChange={handleChange} required type="password" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Status</label>
              <select name="status" value={form.status || 'Active'} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer' }}>{editingUser ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}
      {historyUser && (
        <div style={modalBackdropStyle} onClick={e => { if (e.target === e.currentTarget) closeHistoryModal(); }}>
          <div style={{ ...modalStyle, minWidth: 400, maxWidth: 600, maxHeight: '90vh', overflow: 'visible', position: 'relative' }}>
            <button type="button" onClick={closeHistoryModal} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>User History</h3>
            {/* Scroll Up Button */}
            <button
              style={{ position: 'absolute', right: 24, top: 60, zIndex: 10, background: '#3C91E6', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}
              onClick={() => { if (historyContentRef.current) historyContentRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="Scroll to top"
            >↑</button>
            {/* Scrollable Content Area */}
            <div ref={historyContentRef} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8, marginBottom: 12, borderRadius: 8, background: '#f9fafb', boxShadow: '0 1px 4px #0001' }}>
              {historyLoading ? (
                <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 18 }}>Loading history...</div>
              ) : historyError ? (
                <div style={{ color: 'red', padding: '32px 0', textAlign: 'center', fontSize: 18 }}>{historyError}</div>
              ) : (
                <div style={{ padding: 8 }}>
                  {/* Orders Section */}
                  <div style={{ marginBottom: 8 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 4 }}>Orders</h4>
                    {userOrders.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16 }}>No orders found.</div>
                    ) : (
                      <ul style={{ maxHeight: 140, overflowY: 'auto', paddingLeft: 18 }}>
                        {userOrders.map((order, idx) => (
                          <li key={order._id || idx} style={{ marginBottom: 10, fontSize: 15, background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
                            <span><strong>Order ID:</strong> {order._id} <br/>
                            <strong>Date:</strong> {order.date ? new Date(order.date).toLocaleString() : 'N/A'} <br/>
                            <strong>Status:</strong> {order.status || 'N/A'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Scroll Down Button */}
            <button
              style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10, background: '#3C91E6', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}
              onClick={() => { if (historyContentRef.current) historyContentRef.current.scrollTo({ top: historyContentRef.current.scrollHeight, behavior: 'smooth' }); }}
              title="Scroll to bottom"
            >↓</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam; 