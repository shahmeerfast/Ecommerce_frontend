import React, { useState, useEffect } from 'react'
import { useShopContext } from '../context/ShopContext'
import { Navigate } from 'react-router-dom'
import axios from '../config/axios'
import { toast } from 'react-toastify'
import PaymentMethodsSection from '../components/profile/PaymentMethodsSection'
import SellerProfile from '../components/profile/SellerProfile'

const Profile = () => {
  const { user, setUser } = useShopContext()
  // Debug log for user object
  console.log('Profile.jsx user object:', user);
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    password: '',
    profileImage: user?.profileImage || ''
  })
  const [loading, setLoading] = useState(false)
  const fileInputRef = React.useRef();
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  
  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false
  });

  // Always fetch latest seller profile on mount if seller
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (user && user.role === 'seller') {
        try {
          const res = await axios.get('/api/seller/profile', { headers: { token: localStorage.getItem('token') } });
          if (res.data && res.data.success) {
            setUser(res.data.seller);
            localStorage.setItem('user', JSON.stringify(res.data.seller));
          }
        } catch (err) {
          // Optionally handle error
        }
      }
    };
    fetchSellerProfile();
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  if (!user) return <Navigate to="/login" />

  // If seller, show only SellerProfile
  if (user.role === 'seller') {
    return <SellerProfile seller={user} onUpdate={setUser} />
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleEdit = () => setEditMode(true)
  const handleCancel = () => setEditMode(false)
  const handleSave = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const isSeller = user?.role === 'seller';
      const endpoint = isSeller ? '/api/seller/profile' : '/api/user/profile';
      const res = await axios.put(endpoint, {
        name: form.name,
        email: form.email,
        profileImage: form.profileImage
      })
      if (res.data && (res.data.user || res.data.seller)) {
        // Ensure both fullName and name are set for consistency
        const updatedUser = {
          ...user,
          ...(res.data.user || res.data.seller),
          fullName: (res.data.user || res.data.seller).fullName || (res.data.user || res.data.seller).name || user.fullName || user.name,
          name: (res.data.user || res.data.seller).name || (res.data.user || res.data.seller).fullName || user.name || user.fullName,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile.')
      }
    } catch (err) {
      toast.error('Error updating profile.')
    } finally {
      setLoading(false)
      setEditMode(false)
    }
  }

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const isSeller = user?.role === 'seller';
      const endpoint = isSeller ? '/api/seller/upload-profile-image' : '/api/user/upload-profile-image';
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setForm(f => ({ ...f, profileImage: res.data.url }));
        toast.success('Profile image uploaded!');
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err) {
      toast.error('Error uploading image.');
    } finally {
      setLoading(false);
    }
  };

  // Address management functions
  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await axios.get('/api/user/addresses');
      if (res.data && res.data.success) {
        setAddresses(res.data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
      isDefault: addresses.length === 0
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        const res = await axios.put(`/api/user/addresses/${editingAddress._id}`, addressForm);
        if (res.data && res.data.success) {
          toast.success('Address updated successfully!');
          fetchAddresses();
        }
      } else {
        // Add new address
        const res = await axios.post('/api/user/addresses', addressForm);
        if (res.data && res.data.success) {
          toast.success('Address added successfully!');
          fetchAddresses();
        }
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await axios.delete(`/api/user/addresses/${addressId}`);
      if (res.data && res.data.success) {
        toast.success('Address deleted successfully!');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await axios.put(`/api/user/addresses/${addressId}/default`);
      if (res.data && res.data.success) {
        toast.success('Default address updated!');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  useEffect(() => {
    console.log('Profile user object:', user);
  }, [user]);

  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError('');
      try {
        const res = await axios.get('/api/activity-logs/user', {
          headers: { token: localStorage.getItem('token') }
        });
        if (res.data && res.data.success) {
          setActivity(res.data.activities || []);
        } else {
          setActivityError('Failed to load activity.');
        }
      } catch (err) {
        setActivityError('Failed to load activity.');
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
    fetchAddresses();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center gap-6">
        {(() => { const imgUrl = user.profileImage && user.profileImage !== '' ? user.profileImage : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || user.name || user.email); console.log('Profile.jsx avatar img src:', imgUrl); return null; })()}
        <img src={user.profileImage && user.profileImage !== '' ? user.profileImage : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || user.name || user.email)} alt="Profile" className="w-24 h-24 rounded-full object-cover border" />
        <div>
          <h1 className="text-3xl font-bold mb-1">{user.fullName || user.name || 'No Name'}</h1>
          <p className="text-gray-600 mb-1">{user.email}</p>
          <p className="text-gray-400 text-sm">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          <button className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors" onClick={handleEdit}>Edit Profile</button>
        </div>
      </div>

      {editMode && (
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <div className="flex items-center gap-6 mb-4">
            <img
              src={form.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(form.name || form.email)}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border cursor-pointer hover:opacity-80"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          {activityLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : activityError ? (
            <p className="text-red-500">{activityError}</p>
          ) : activity.length === 0 ? (
            <p className="text-gray-500">No recent activity yet.</p>
          ) : (
            <ul className="text-gray-600 space-y-2">
              {activity.map((item, idx) => (
                <li key={item._id || idx} className="flex items-center gap-2">
                  <span className="font-medium">{item.action || item.actionType || 'Activity'}</span>
                  <span className="text-xs text-gray-400">{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Loyalty Points</h2>
          <p className="text-gray-500">You have <span className="font-bold">{user.loyaltyPoints ?? 0}</span> loyalty points.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Membership Status</h2>
          <p className="text-gray-500">Standard Member</p>
        </div>
        
        {/* Address Book Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Address Book</h2>
            <button 
              onClick={handleAddAddress}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
            >
              Add New Address
            </button>
          </div>
          
          {addressLoading ? (
            <p className="text-gray-400">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500">No saved addresses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div key={address._id} className="border rounded-lg p-4 relative">
                  {address.isDefault && (
                    <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <h3 className="font-semibold mb-2">{address.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                  <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                  <p className="text-gray-600 text-sm mb-1">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-gray-600 text-sm mb-3">{address.country}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <PaymentMethodsSection />
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSaveAddress}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={addressForm.name}
                  onChange={handleAddressChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Address *</label>
                <textarea
                  name="address"
                  value={addressForm.address}
                  onChange={handleAddressChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={addressForm.postalCode}
                    onChange={handleAddressChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={addressForm.country}
                    onChange={handleAddressChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={addressLoading}
                >
                  {addressLoading ? 'Saving...' : (editingAddress ? 'Update' : 'Add')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 