import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useShopContext } from '../../context/ShopContext';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const AdminProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useShopContext();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = profileImage;
      if (imageFile) {
        // Upload image to server/cloudinary (assume /api/user/upload-profile-image)
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axios.post('/api/user/upload-profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data', token: user.token }
        });
        imageUrl = uploadRes.data.url;
      }
      const res = await axios.put('/api/user/profile', {
        name,
        email,
        profileImage: imageUrl
      }, { headers: { token: user.token } });
      console.log('Profile update response:', res.data);
      // Accept both name and fullName for compatibility
      const updatedUser = res.data.user;
      if (updatedUser.fullName && !updatedUser.name) {
        updatedUser.name = updatedUser.fullName;
      }
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 16px #0003', position: 'relative' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <label htmlFor="profile-image-upload" style={{ cursor: 'pointer' }}>
            <img src={profileImage || 'https://randomuser.me/api/portraits/women/44.jpg'} alt="Profile" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
            <input id="profile-image-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </label>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{user?.role === 'admin' ? 'Admin' : 'User'}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #eee' }} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #eee' }} required />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AdminProfileModal; 