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

// Badge map
const LEVEL_BADGES = {
  new: '🌱',
  trusted: '🤝',
  premium: '👑',
};
const LEVEL_LABELS = {
  new: 'New',
  trusted: 'Trusted',
  premium: 'Premium',
};

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSeller, setEditingSeller] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', isActive: true, level: 'new' });
  const [showForm, setShowForm] = useState(false);
  const [historySeller, setHistorySeller] = useState(null); // seller whose history is being viewed
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [sellerPayouts, setSellerPayouts] = useState([]);
  const [sellerMessages, setSellerMessages] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [productReviews, setProductReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const historyContentRef = useRef(null);

  // Fetch all sellers
  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/seller/admin/all', { headers: { token } });
      setSellers(res.data.sellers || []);
    } catch (err) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSellers(); }, []);

  // Handle form input
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add or update seller
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingSeller) {
        await axios.put(`/api/seller/admin/${editingSeller._id}`, form, { headers: { token } });
        toast.success('Seller updated');
      } else {
        await axios.post('/api/seller/admin/add', form, { headers: { token } });
        toast.success('Seller added');
      }
      setShowForm(false);
      setEditingSeller(null);
      setForm({ fullName: '', email: '', username: '', password: '', isActive: true, level: 'new' });
      fetchSellers();
    } catch (err) {
      toast.error('Failed to save seller');
    }
  };

  // Edit seller
  const handleEdit = seller => {
    setEditingSeller(seller);
    setForm({ fullName: seller.fullName || '', email: seller.email, username: seller.username, password: '', isActive: seller.isActive, level: seller.level || 'new' });
    setShowForm(true);
  };

  // Delete seller
  const handleDelete = async seller => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;
    try {
      await axios.delete(`/api/seller/admin/${seller._id}`, { headers: { token } });
      toast.success('Seller deleted');
      fetchSellers();
    } catch (err) {
      toast.error('Failed to delete seller');
    }
  };

  // Fetch seller history (orders, payouts, products, reviews)
  const openHistoryModal = async (seller) => {
    setHistorySeller(seller);
    setHistoryLoading(true);
    setHistoryError(null);
    setSellerPayouts([]);
    setSellerOrders([]);
    setSellerProducts([]);
    setProductReviews({});
    setReviewsLoading(false);
    try {
      const res = await axios.get(`/api/seller/admin/history/${seller._id}`, { headers: { token } });
      if (res.data.success) {
        setSellerPayouts(res.data.payouts || []);
        setSellerOrders(res.data.orders || []);
        setSellerProducts(res.data.products || []);
        // Fetch reviews for each product
        setReviewsLoading(true);
        const reviewsObj = {};
        for (const product of res.data.products || []) {
          try {
            const reviewsRes = await axios.get(`/api/product/${product._id}/reviews`);
            if (reviewsRes.data.success && Array.isArray(reviewsRes.data.reviews)) {
              reviewsObj[product._id] = reviewsRes.data.reviews;
            } else {
              reviewsObj[product._id] = [];
            }
          } catch {
            reviewsObj[product._id] = [];
          }
        }
        setProductReviews(reviewsObj);
        setReviewsLoading(false);
      } else {
        setHistoryError('Failed to load seller history.');
      }
    } catch (err) {
      setHistoryError('Failed to load seller history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Close history modal
  const closeHistoryModal = () => setHistorySeller(null);

  return (
    <div className="admin-sellers-root" style={{ padding: 32, minHeight: '80vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Team <span style={{ fontWeight: 400, fontSize: 18, color: '#888' }}>(Sellers)</span></div>
        <div className="admin-sellers-table-container" style={{ borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 0, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 32 }}>Loading...</div> : (
            <table className="admin-sellers-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Username</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map(seller => (
                  <tr key={seller._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 12px' }}>
                      {seller.fullName}
                      <span style={{ marginLeft: 8, fontSize: 18 }} title={LEVEL_LABELS[seller.level || 'new']}>
                        {LEVEL_BADGES[seller.level || 'new']}
                      </span>
                      <span style={{ marginLeft: 4, fontSize: 13, color: '#888', fontWeight: 500 }}>
                        {LEVEL_LABELS[seller.level || 'new']}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{seller.email}</td>
                    <td style={{ padding: '14px 12px' }}>{seller.username}</td>
                    <td style={{ padding: '14px 12px' }}>{seller.phone || '-'}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{ color: seller.isActive ? '#3C91E6' : '#FD3C4A', fontWeight: 600 }}>{seller.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{new Date(seller.registeredAt).toLocaleString()}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button
                        className="admin-seller-edit-btn"
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
                        onClick={() => handleEdit(seller)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-seller-delete-btn"
                        style={{
                          background: '#e53e3e',
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
                        onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                        onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                        onClick={() => handleDelete(seller)}
                      >
                        Delete
                      </button>
                      <button
                        className="admin-seller-history-btn"
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
                        onClick={() => openHistoryModal(seller)}
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
          <form className="admin-seller-modal" onSubmit={handleSubmit} style={{
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
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{editingSeller ? 'Edit Seller' : 'Add Seller'}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input name="email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Username</label>
              <input name="username" value={form.username} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            {!editingSeller && <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input name="password" value={form.password} onChange={handleChange} required type="password" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Status</label>
              <select name="isActive" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Level</label>
              <select name="level" value={form.level} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                <option value="new">🌱 New</option>
                <option value="trusted">🤝 Trusted</option>
                <option value="premium">👑 Premium</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#3C91E6', color: '#fff', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer' }}>{editingSeller ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}
      {/* Seller History Modal */}
      {historySeller && (
        <div style={modalBackdropStyle} onClick={e => { if (e.target === e.currentTarget) closeHistoryModal(); }}>
          <div style={{ ...modalStyle, minWidth: 400, maxWidth: 600, maxHeight: '90vh', overflow: 'visible', position: 'relative' }}>
            <button type="button" onClick={closeHistoryModal} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Seller History {LEVEL_BADGES[historySeller.level || 'new']} <span style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>{LEVEL_LABELS[historySeller.level || 'new']}</span></h3>
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
                  <div style={{ marginBottom: 28 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 4 }}>Orders</h4>
                    {sellerOrders.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16 }}>No orders found.</div>
                    ) : (
                      <ul style={{ maxHeight: 140, overflowY: 'auto', paddingLeft: 18 }}>
                        {sellerOrders.map((order, idx) => (
                          <li key={order._id || idx} style={{ marginBottom: 10, fontSize: 15, background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
                            <span><strong>Order ID:</strong> {order._id} <br/>
                            <strong>Date:</strong> {order.date ? new Date(order.date).toLocaleString() : 'N/A'} <br/>
                            <strong>Status:</strong> {order.status || 'N/A'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Payouts Section */}
                  <div style={{ marginBottom: 28 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 4 }}>Payouts</h4>
                    {sellerPayouts.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16 }}>No payouts found.</div>
                    ) : (
                      <ul style={{ maxHeight: 140, overflowY: 'auto', paddingLeft: 18 }}>
                        {sellerPayouts.map((payout, idx) => (
                          <li key={payout._id || idx} style={{ marginBottom: 10, fontSize: 15, background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
                            <span><strong>Amount:</strong> {payout.payoutAmount || payout.amount} <br/>
                            <strong>Status:</strong> {payout.status} <br/>
                            <strong>Date:</strong> {new Date(payout.createdAt).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Products Section */}
                  <div style={{ marginBottom: 8 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 4 }}>Products</h4>
                    {sellerProducts.length === 0 ? (
                      <div style={{ color: '#888', fontSize: 16 }}>No products found.</div>
                    ) : (
                      <ul style={{ maxHeight: 140, overflowY: 'auto', paddingLeft: 18 }}>
                        {sellerProducts.map((product, idx) => (
                          <li key={product._id || idx} style={{ marginBottom: 10, fontSize: 15, background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
                            <span><strong>Name:</strong> {product.name} <br/>
                            <strong>Price:</strong> {product.price} <br/>
                            <strong>Status:</strong> {product.status || 'N/A'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Reviews Section */}
                  <div style={{ marginBottom: 8 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 4 }}>Reviews</h4>
                    {reviewsLoading ? (
                      <div style={{ color: '#888', fontSize: 16 }}>Loading reviews...</div>
                    ) : (
                      Object.values(productReviews).flat().length === 0 ? (
                        <div style={{ color: '#888', fontSize: 16 }}>No reviews found.</div>
                      ) : (
                        <ul style={{ maxHeight: 140, overflowY: 'auto', paddingLeft: 18 }}>
                          {sellerProducts.map(product => (
                            (productReviews[product._id] || []).map((review, idx) => (
                              <li key={review._id || idx} style={{ marginBottom: 10, fontSize: 15, background: '#f3f4f6', borderRadius: 6, padding: '8px 12px' }}>
                                <span>
                                  <strong>Product:</strong> {product.name} <br/>
                                  <strong>Reviewer:</strong> {review.user?.fullName || review.user?.name || review.user?.email || 'Unknown'} <br/>
                                  <strong>Rating:</strong> {review.rating} <br/>
                                  <strong>Comment:</strong> {review.comment} <br/>
                                  <strong>Date:</strong> {review.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                                </span>
                              </li>
                            ))
                          ))}
                        </ul>
                      )
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

export default AdminSellers; 