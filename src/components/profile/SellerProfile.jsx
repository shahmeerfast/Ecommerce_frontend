import React, { useState, useEffect, useRef } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import MyListings from './MyListings';

const SellerProfile = ({ seller, onUpdate }) => {
  const [form, setForm] = useState({
    name: seller?.name || seller?.fullName || '',
    email: seller?.email || '',
    phone: seller?.phone || '',
    password: '',
    profileImage: seller?.profileImage || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef();

  // Business info state
  const [editBusiness, setEditBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    fullName: seller?.fullName || '',
    businessRegNumber: seller?.businessRegNumber || '',
    streetAddress: seller?.streetAddress || '',
    state: seller?.state || '',
    country: seller?.country || '',
    zipCode: seller?.zipCode || '',
  });
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessSuccess, setBusinessSuccess] = useState('');
  const [businessError, setBusinessError] = useState('');

  // Bank details state
  const [editBank, setEditBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: seller?.bankDetails?.accountHolderName || '',
    bankName: seller?.bankDetails?.bankName || '',
    accountNumber: seller?.bankDetails?.accountNumber || '',
    bankBranch: seller?.bankDetails?.bankBranch || '',
    ifscSwiftCode: seller?.bankDetails?.ifscSwiftCode || '',
    bankCountry: seller?.bankDetails?.bankCountry || '',
  });
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // Payouts state
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showPayouts, setShowPayouts] = useState(false);

  // Analytics & Reports state
  const [analytics, setAnalytics] = useState(null);
  const [productPerf, setProductPerf] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const csvLinkRef = useRef();
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);

  // Sync businessForm with seller prop when seller changes
  useEffect(() => {
    setBusinessForm({
      fullName: seller?.fullName || '',
      businessRegNumber: seller?.businessRegNumber || '',
      streetAddress: seller?.streetAddress || '',
      state: seller?.state || '',
      country: seller?.country || '',
      zipCode: seller?.zipCode || '',
    });
  }, [seller]);

  // Sync bankForm with seller prop when seller changes
  useEffect(() => {
    setBankForm({
      accountHolderName: seller?.bankDetails?.accountHolderName || '',
      bankName: seller?.bankDetails?.bankName || '',
      accountNumber: seller?.bankDetails?.accountNumber || '',
      bankBranch: seller?.bankDetails?.bankBranch || '',
      ifscSwiftCode: seller?.bankDetails?.ifscSwiftCode || '',
      bankCountry: seller?.bankDetails?.bankCountry || '',
    });
  }, [seller]);

  // Fetch seller payouts on mount
  useEffect(() => {
    const fetchPayouts = async () => {
      setPayoutsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/payment-distribution/seller/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayouts(res.data.payouts || []);
      } catch (err) {
        toast.error('Failed to fetch payouts');
      } finally {
        setPayoutsLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [overviewRes, productsRes] = await Promise.all([
          axios.get('/api/seller/analytics/overview', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/seller/analytics/products', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAnalytics(overviewRes.data);
        setProductPerf(productsRes.data);
      } catch (err) {
        toast.error('Failed to fetch analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setForm(f => ({ ...f, profileImage: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    let profileImageUrl = form.profileImage;
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axios.post('/api/seller/upload-profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data', token: localStorage.getItem('token') }
        });
        profileImageUrl = uploadRes.data.url;
      }
      const res = await axios.put('/api/seller/profile', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password || undefined,
        profileImage: profileImageUrl,
      }, { headers: { token: localStorage.getItem('token') } });
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '' }));
      setEditMode(false);
      if (onUpdate) onUpdate(res.data.seller);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleBusinessChange = (e) => {
    setBusinessForm({ ...businessForm, [e.target.name]: e.target.value });
  };

  const handleBusinessSave = async (e) => {
    e.preventDefault();
    setBusinessLoading(true);
    setBusinessSuccess('');
    setBusinessError('');
    try {
      const res = await axios.put('/api/seller/profile', {
        fullName: businessForm.fullName,
        businessRegNumber: businessForm.businessRegNumber,
        streetAddress: businessForm.streetAddress,
        state: businessForm.state,
        country: businessForm.country,
        zipCode: businessForm.zipCode,
      }, { headers: { token: localStorage.getItem('token') } });
      setBusinessSuccess('Business info updated!');
      setEditBusiness(false);
      // Fetch latest seller profile from backend
      const profileRes = await axios.get('/api/seller/profile', { headers: { token: localStorage.getItem('token') } });
      if (profileRes.data && profileRes.data.success && onUpdate) {
        onUpdate(profileRes.data.seller);
      }
      setBusinessForm({
        fullName: res.data.seller.fullName || '',
        businessRegNumber: res.data.seller.businessRegNumber || '',
        streetAddress: res.data.seller.streetAddress || '',
        state: res.data.seller.state || '',
        country: res.data.seller.country || '',
        zipCode: res.data.seller.zipCode || '',
      });
    } catch (err) {
      setBusinessError(err.response?.data?.message || 'Failed to update business info');
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleBankChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleBankSave = async (e) => {
    e.preventDefault();
    setBankLoading(true);
    setBankSuccess('');
    setBankError('');
    try {
      const res = await axios.put('/api/seller/profile', {
        bankDetails: { ...bankForm },
      }, { headers: { token: localStorage.getItem('token') } });
      setBankSuccess('Bank details updated!');
      setEditBank(false);
      // Fetch latest seller profile from backend
      const profileRes = await axios.get('/api/seller/profile', { headers: { token: localStorage.getItem('token') } });
      if (profileRes.data && profileRes.data.success && onUpdate) {
        onUpdate(profileRes.data.seller);
      }
      setBankForm({
        accountHolderName: res.data.seller.bankDetails?.accountHolderName || '',
        bankName: res.data.seller.bankDetails?.bankName || '',
        accountNumber: res.data.seller.bankDetails?.accountNumber || '',
        bankBranch: res.data.seller.bankDetails?.bankBranch || '',
        ifscSwiftCode: res.data.seller.bankDetails?.ifscSwiftCode || '',
        bankCountry: res.data.seller.bankDetails?.bankCountry || '',
      });
    } catch (err) {
      setBankError(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setBankLoading(false);
    }
  };

  // Calculate payout stats
  const totalPayouts = payouts.length;
  const totalAmount = payouts.reduce((sum, p) => sum + (p.payoutAmount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const paidPayouts = payouts.filter(p => p.status === 'paid').length;

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/seller/analytics/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      // Download CSV
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'seller-analytics.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center gap-6">
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
          onChange={handleImageChange}
        />
        <div>
          <h1 className="text-3xl font-bold mb-1">{form.name || 'No Name'}</h1>
          <p className="text-gray-600 mb-1">{form.email}</p>
          <p className="text-gray-400 text-sm">Joined: {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}</p>
          <button
            className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            onClick={() => setEditMode(true)}
            type="button"
          >
            Edit Profile
          </button>
        </div>
      </div>
      {/* Edit Form Card */}
      {editMode && (
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block mb-1">New Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Leave blank to keep current password" />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <div className="flex gap-4">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      )}
      {/* Business Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        {businessError && <div className="text-red-600 mb-2">{businessError}</div>}
        {businessSuccess && <div className="text-green-600 mb-2">{businessSuccess}</div>}
        {!editBusiness ? (
          <>
            <div className="mb-2"><span className="font-medium">Business Name:</span> {businessForm.fullName}</div>
            <div className="mb-2"><span className="font-medium">Registration Number:</span> {businessForm.businessRegNumber}</div>
            <div className="mb-2"><span className="font-medium">Address:</span> {businessForm.streetAddress}, {businessForm.state}, {businessForm.country} {businessForm.zipCode}</div>
            <button
              className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              onClick={() => setEditBusiness(true)}
              type="button"
            >
              Edit Business Info
            </button>
          </>
        ) : (
          <form onSubmit={handleBusinessSave} className="mt-4">
            <div className="mb-4">
              <label className="block mb-1">Business Name</label>
              <input type="text" name="fullName" value={businessForm.fullName} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Registration Number</label>
              <input type="text" name="businessRegNumber" value={businessForm.businessRegNumber} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Street Address</label>
              <input type="text" name="streetAddress" value={businessForm.streetAddress} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">State</label>
              <input type="text" name="state" value={businessForm.state} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Country</label>
              <input type="text" name="country" value={businessForm.country} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Zip Code</label>
              <input type="text" name="zipCode" value={businessForm.zipCode} onChange={handleBusinessChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors" disabled={businessLoading}>{businessLoading ? 'Saving...' : 'Save'}</button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={() => setEditBusiness(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      {/* Bank Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
        {bankError && <div className="text-red-600 mb-2">{bankError}</div>}
        {bankSuccess && <div className="text-green-600 mb-2">{bankSuccess}</div>}
        {!editBank ? (
          <>
            <div className="mb-2"><span className="font-medium">Account Holder Name:</span> {bankForm.accountHolderName || <span className='text-gray-400'>Not set</span>}</div>
            <div className="mb-2"><span className="font-medium">Bank Name:</span> {bankForm.bankName || <span className='text-gray-400'>Not set</span>}</div>
            <div className="mb-2"><span className="font-medium">Account Number:</span> {bankForm.accountNumber || <span className='text-gray-400'>Not set</span>}</div>
            <div className="mb-2"><span className="font-medium">Bank Branch:</span> {bankForm.bankBranch || <span className='text-gray-400'>Not set</span>}</div>
            <div className="mb-2"><span className="font-medium">IFSC/SWIFT Code:</span> {bankForm.ifscSwiftCode || <span className='text-gray-400'>Not set</span>}</div>
            <div className="mb-2"><span className="font-medium">Bank Country:</span> {bankForm.bankCountry || <span className='text-gray-400'>Not set</span>}</div>
            <button
              className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              onClick={() => setEditBank(true)}
              type="button"
            >
              Edit Bank Details
            </button>
          </>
        ) : (
          <form onSubmit={handleBankSave} className="mt-4">
            <div className="mb-4">
              <label className="block mb-1">Account Holder Name</label>
              <input type="text" name="accountHolderName" value={bankForm.accountHolderName} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Bank Name</label>
              <input type="text" name="bankName" value={bankForm.bankName} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Account Number</label>
              <input type="text" name="accountNumber" value={bankForm.accountNumber} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Bank Branch</label>
              <input type="text" name="bankBranch" value={bankForm.bankBranch} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">IFSC/SWIFT Code</label>
              <input type="text" name="ifscSwiftCode" value={bankForm.ifscSwiftCode} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Bank Country</label>
              <input type="text" name="bankCountry" value={bankForm.bankCountry} onChange={handleBankChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors" disabled={bankLoading}>{bankLoading ? 'Saving...' : 'Save'}</button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={() => setEditBank(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      {/* Payouts Section */}
      <div className="mt-12">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Payouts</h2>
            <div className="text-lg font-semibold text-gray-800">Total Payouts: <span className="font-bold">{totalPayouts}</span></div>
            <div className="text-gray-600 mt-1">Total Amount: <span className="font-bold text-green-600">₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="text-gray-600 mt-1">Pending: <span className="font-bold text-yellow-600">{pendingPayouts}</span> | Paid: <span className="font-bold text-green-600">{paidPayouts}</span></div>
          </div>
          <button
            className="mt-4 md:mt-0 px-6 py-2 bg-black text-white rounded-md font-bold hover:bg-gray-800 transition"
            onClick={() => setShowPayouts(v => !v)}
          >
            {showPayouts ? 'Hide Payout Details' : 'View Payouts'}
          </button>
        </div>
        {/* Toggleable Payouts Table */}
        {showPayouts && (
          payoutsLoading ? (
            <div>Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div className="text-gray-500">No payouts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout._id}>
                      <td className="px-4 py-2 whitespace-nowrap">Order #{payout.orderId?._id?.slice(-8) || ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap">₦{payout.payoutAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payout.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          payout.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                          payout.status === 'paid' ? 'bg-green-100 text-green-600' :
                          payout.status === 'failed' ? 'bg-red-100 text-red-600' :
                          payout.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{payout.createdAt ? new Date(payout.createdAt).toLocaleString() : ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{payout.notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      {/* Seller Analytics & Reports Section */}
      <div className="mt-12">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col gap-6">
          <h2 className="text-xl font-bold mb-4">Analytics & Reports</h2>
          {analyticsLoading ? (
            <div>Loading analytics...</div>
          ) : analytics ? (
            <>
              <div className="flex flex-wrap gap-8 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[180px] text-center">
                  <div className="text-lg font-semibold text-gray-700">Total Sales</div>
                  <div className="text-2xl font-bold text-blue-700">{analytics.totalSales}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[180px] text-center">
                  <div className="text-lg font-semibold text-gray-700">Total Orders</div>
                  <div className="text-2xl font-bold text-green-700">{analytics.totalOrders}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[180px] text-center">
                  <div className="text-lg font-semibold text-gray-700">Total Revenue</div>
                  <div className="text-2xl font-bold text-yellow-700">₦{analytics.totalRevenue}</div>
                </div>
              </div>
              {/* Charts Section */}
              <div className="flex flex-col lg:flex-row gap-8 mb-6">
                {/* Sales/Orders/Revenue Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4 flex-1">
                  <h4 className="font-semibold mb-2">Sales, Orders & Revenue</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[{ name: 'All Time', Sales: analytics.totalSales, Orders: analytics.totalOrders, Revenue: analytics.totalRevenue }]}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Sales" fill="#8884d8" />
                      <Bar dataKey="Orders" fill="#82ca9d" />
                      <Bar dataKey="Revenue" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Best Selling Products Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4 flex-1">
                  <h4 className="font-semibold mb-2">Best Selling Products</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={productPerf?.best || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSold" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Least Performing Products Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4 flex-1">
                  <h4 className="font-semibold mb-2">Least Performing Products</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={productPerf?.least || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSold" fill="#ff7f7f" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition">Export Product Performance (CSV)</button>
                <button onClick={() => setShowFullAnalytics(v => !v)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition">
                  {showFullAnalytics ? 'Hide Full Analytics' : 'View Full Analytics'}
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Best Selling Products</h4>
                  <ul className="list-disc pl-5">
                    {productPerf?.best?.length ? productPerf.best.map(p => (
                      <li key={p.productId}>{p.name} - {p.totalSold} sold</li>
                    )) : <li>No data</li>}
                  </ul>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Least Performing Products</h4>
                  <ul className="list-disc pl-5">
                    {productPerf?.least?.length ? productPerf.least.map(p => (
                      <li key={p.productId}>{p.name} - {p.totalSold} sold</li>
                    )) : <li>No data</li>}
                  </ul>
                </div>
              </div>
              {showFullAnalytics && productPerf?.all?.length > 0 && (
                <div className="mt-8 overflow-x-auto">
                  <h3 className="text-lg font-bold mb-2">All Products Performance</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productPerf.all.map((prod) => (
                        <tr key={prod.productId}>
                          <td className="px-4 py-2 whitespace-nowrap">{prod.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{prod.productId}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{prod.totalSold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : <div>No analytics data available.</div>}
        </div>
      </div>
      {/* Seller Product Listings Section */}
      <div className="mt-12">
        <MyListings />
      </div>
    </div>
  );
};

export default SellerProfile; 