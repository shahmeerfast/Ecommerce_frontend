import React, { useState, useEffect } from 'react';
import { useShopContext } from '../../context/ShopContext';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const { user, setUser } = useShopContext();
  const [profile, setProfile] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    password: '',
  });
  const [company, setCompany] = useState({
    companyName: '',
    supportEmail: ''
  });
  const [notifications, setNotifications] = useState({
    admin: true,
    user: true
  });
  const [loading, setLoading] = useState(false);
  const token = user?.token || localStorage.getItem('token');

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings', { headers: { token } });
        setCompany({
          companyName: res.data.companyName || '',
          supportEmail: res.data.supportEmail || ''
        });
        setNotifications({
          admin: res.data.notificationPreferences?.admin ?? true,
          user: res.data.notificationPreferences?.user ?? true
        });
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, [token]);

  // Handle profile update
  const handleProfileChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleProfileSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/user/profile', {
        name: profile.name,
        email: profile.email,
        ...(profile.password ? { password: profile.password } : {})
      }, { headers: { token } });
      setUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle company info update
  const handleCompanyChange = e => setCompany({ ...company, [e.target.name]: e.target.value });
  const handleCompanySave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/settings', {
        companyName: company.companyName,
        supportEmail: company.supportEmail
      }, { headers: { token } });
      toast.success('Company info saved');
    } catch (err) {
      toast.error('Failed to save company info');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification preferences
  const handleNotifChange = e => setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  const handleNotifSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/settings', {
        notificationPreferences: notifications
      }, { headers: { token } });
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-settings-root" style={{ padding: 32, minHeight: '80vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Profile Settings */}
        <div className="admin-settings-card" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Profile Settings</h2>
          <form className="admin-settings-form" onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontWeight: 500 }}>Name</label>
              <input name="name" value={profile.name} onChange={handleProfileChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Email</label>
              <input name="email" value={profile.email} onChange={handleProfileChange} required type="email" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>New Password</label>
              <input name="password" value={profile.password} onChange={handleProfileChange} type="password" placeholder="Leave blank to keep current" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: 180, padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 }}>{loading ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>
        {/* Company Info */}
        <div className="admin-settings-card" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Company Info</h2>
          <form className="admin-settings-form" onSubmit={handleCompanySave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontWeight: 500 }}>Company Name</label>
              <input name="companyName" value={company.companyName} onChange={handleCompanyChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Support Email</label>
              <input name="supportEmail" value={company.supportEmail} onChange={handleCompanyChange} type="email" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: 180, padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 }}>{loading ? 'Saving...' : 'Save Company Info'}</button>
          </form>
        </div>
        {/* Notification Preferences */}
        <div className="admin-settings-card" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Notification Preferences</h2>
          <form className="admin-settings-form" onSubmit={handleNotifSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" name="admin" checked={notifications.admin} onChange={handleNotifChange} />
              Admin notifications (system alerts, new registrations)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" name="user" checked={notifications.user} onChange={handleNotifChange} />
              User notifications (orders, messages)
            </label>
            <button type="submit" disabled={loading} style={{ width: 220, padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 }}>{loading ? 'Saving...' : 'Save Notification Preferences'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 