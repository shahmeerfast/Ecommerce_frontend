import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { useShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';

const FILTERS = [
  { label: 'All Products', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const AdminDashboardHome = () => {
  const { user, token } = useShopContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState({ baseDeliveryFee: '', deliveryRatePerKm: '', maxDeliveryFee: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [netWorth, setNetWorth] = useState(0);
  const [netWorthAdjustments, setNetWorthAdjustments] = useState([]);
  const [netWorthLoading, setNetWorthLoading] = useState(false);
  const [netWorthError, setNetWorthError] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustType, setAdjustType] = useState('other');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch all products for dashboard
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product/admin/all`, {
          headers: { token: localStorage.getItem('token') || token }
        });
        setProducts(response.data.products);
        // Calculate statistics
        const stats = response.data.products.reduce((acc, product) => {
          acc.total++;
          acc[product.approvalStatus]++;
          return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
        setStats(stats);
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'dashboard') fetchProducts();
  }, [token, activeTab]);

  // Fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLogsLoading(true);
        const res = await axios.get('/api/activity-logs', { headers: { token } });
        setActivityLogs(res.data.logs);
      } catch (err) {
        toast.error('Failed to fetch activity logs');
      } finally {
        setLogsLoading(false);
      }
    };
    if (activeTab === 'activity') fetchActivityLogs();
  }, [activeTab, token]);

  // Fetch delivery settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await axios.get('/api/settings');
        setDeliverySettings({
          baseDeliveryFee: res.data.baseDeliveryFee || '',
          deliveryRatePerKm: res.data.deliveryRatePerKm || '',
          maxDeliveryFee: res.data.maxDeliveryFee || ''
        });
        setSettingsError('');
      } catch (err) {
        setSettingsError('Failed to load delivery settings');
      } finally {
        setSettingsLoading(false);
      }
    };
    if (activeTab === 'delivery') fetchSettings();
  }, [activeTab]);

  // Fetch company net worth
  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        setNetWorthLoading(true);
        const res = await axios.get('/api/settings/net-worth', { headers: { token } });
        setNetWorth(res.data.companyNetWorth);
        setNetWorthAdjustments(res.data.netWorthManualAdjustments || []);
        setNetWorthError('');
      } catch (err) {
        setNetWorthError('Failed to load company net worth');
      } finally {
        setNetWorthLoading(false);
      }
    };
    if (activeTab === 'networth') fetchNetWorth();
  }, [activeTab, token]);

  // Delivery settings handlers
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setDeliverySettings(prev => ({ ...prev, [name]: value }));
  };
  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      await axios.put('/api/settings', deliverySettings, { headers: { token } });
      toast.success('Delivery settings updated');
      setSettingsError('');
    } catch (err) {
      setSettingsError('Failed to update settings');
      toast.error('Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Net worth adjustment handler
  const handleNetWorthAdjust = async (e) => {
    e.preventDefault();
    if (!adjustAmount || !adjustReason) {
      toast.error('Amount and reason are required');
      return;
    }
    try {
      setAdjustLoading(true);
      const res = await axios.post('/api/settings/net-worth/adjust', {
        amount: Number(adjustAmount),
        reason: adjustReason,
        type: adjustType
      }, { headers: { token } });
      setNetWorth(res.data.companyNetWorth);
      setNetWorthAdjustments(res.data.netWorthManualAdjustments || []);
      setAdjustAmount('');
      setAdjustReason('');
      setAdjustType('other');
      setNetWorthError('');
      toast.success('Net worth adjusted');
    } catch (err) {
      setNetWorthError('Failed to adjust net worth');
      toast.error('Failed to adjust net worth');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' ? true : product.approvalStatus === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        <button onClick={() => setActiveTab('dashboard')} className={`dashboard-tab-btn${activeTab === 'dashboard' ? ' active' : ''}`}>Dashboard</button>
        <button onClick={() => setActiveTab('activity')} className={`dashboard-tab-btn${activeTab === 'activity' ? ' active' : ''}`}>Activity & Transaction History</button>
        <button onClick={() => setActiveTab('networth')} className={`dashboard-tab-btn${activeTab === 'networth' ? ' active' : ''}`}>Company Net Worth</button>
        <button onClick={() => setActiveTab('delivery')} className={`dashboard-tab-btn${activeTab === 'delivery' ? ' active' : ''}`}>Delivery Settings</button>
      </div>
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div className="admin-dashboard-title" style={{ fontWeight: 'bold', fontSize: 32, marginBottom: 24 }}>Admin Dashboard</div>
          <div className="admin-dashboard-cards">
            <div className="admin-card">
              <i className="bx bxs-calendar-check admin-card-icon calendar"></i>
              <div>
                <div className="admin-card-value">{stats.total}</div>
                <div className="admin-card-label">Total</div>
              </div>
            </div>
            <div className="admin-card">
              <i className="bx bxs-group admin-card-icon group"></i>
              <div>
                <div className="admin-card-value">{stats.pending}</div>
                <div className="admin-card-label">Pending</div>
              </div>
            </div>
            <div className="admin-card">
              <i className="bx bxs-dollar-circle admin-card-icon dollar"></i>
              <div>
                <div className="admin-card-value">{stats.approved}</div>
                <div className="admin-card-label">Approved</div>
              </div>
            </div>
            <div className="admin-card">
              <i className="bx bxs-dollar-circle admin-card-icon reject"></i>
              <div>
                <div className="admin-card-value">{stats.rejected}</div>
                <div className="admin-card-label">Rejected</div>
              </div>
            </div>
          </div>
          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: 16 }}
              />
              <span style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#3C91E6',
                fontSize: 20,
                pointerEvents: 'none',
              }}>
                <i className="bx bx-search"></i>
              </span>
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #eee', fontSize: 16 }}
            >
              {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          {/* Product Grid */}
          {loading ? (
            <div>Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 32 }}>No products found</div>
          ) : (
            <div className="admin-product-grid">
              {filteredProducts.map(product => (
                <div key={product._id} className="admin-product-card">
                  <img src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/200'} alt={product.name} className="admin-product-img" />
                  <div className="admin-product-name">{product.name}</div>
                  <div className="admin-product-category admin-card-muted">{product.category}</div>
                  <div className="admin-product-price">₦{product.price?.toLocaleString()}</div>
                  <div className="admin-product-status admin-card-muted">Status: <span style={{ textTransform: 'capitalize' }}>{product.approvalStatus}</span></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="table-data">
          <div className="order" style={{ width: '100%' }}>
            <div className="head">
              <h3>Activity & Transaction History</h3>
            </div>
            {logsLoading ? (
              <div>Loading...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr><td colSpan={6}>No activity found.</td></tr>
                  ) : (
                    activityLogs.map(log => (
                      <tr key={log._id}>
                        <td>{log.actionType}</td>
                        <td>{log.description}</td>
                        <td>{log.userName || (log.userModel ? `${log.userModel}: ${log.user || ''}` : '')}</td>
                        <td>{log.status || '-'}</td>
                        <td>{log.amount ? `₦${log.amount}` : '-'}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {/* Company Net Worth Tab */}
      {activeTab === 'networth' && (
        <div className="table-data">
          <div className="order" style={{ width: '100%' }}>
            <div className="head">
              <h3>Company Net Worth</h3>
            </div>
            {netWorthLoading ? (
              <div>Loading...</div>
            ) : netWorthError ? (
              <div style={{ color: 'red' }}>{netWorthError}</div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontWeight: 'bold', fontSize: 24 }}>₦{(typeof netWorth === 'number' && !isNaN(netWorth) ? netWorth : 0).toLocaleString()}</span>
                </div>
                <form onSubmit={handleNetWorthAdjust} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <select value={adjustType} onChange={e => setAdjustType(e.target.value)} required>
                    <option value="refund">Refund</option>
                    <option value="salary">Salary</option>
                    <option value="other">Other</option>
                  </select>
                  <input type="number" step="any" placeholder="Amount (₦)" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} required />
                  <input type="text" placeholder="Reason" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} required />
                  <button
                    type="submit"
                    disabled={adjustLoading}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 8,
                      background: '#3C91E6',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      border: 'none',
                      cursor: adjustLoading ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      boxShadow: '0 2px 8px #0001',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                    onMouseOut={e => e.currentTarget.style.background = '#3C91E6'}
                  >
                    {adjustLoading ? 'Saving...' : 'Adjust'}
                  </button>
                </form>
                <span style={{ fontSize: 12, color: '#888' }}>Use negative amount for deductions (e.g., refunds, salaries).</span>
                <div style={{ marginTop: 16 }}>
                  <h4>Manual Adjustments</h4>
                  {netWorthAdjustments.length === 0 ? (
                    <div style={{ color: '#888' }}>No manual adjustments yet.</div>
                  ) : (
                    <ul style={{ maxHeight: 160, overflowY: 'auto', fontSize: 14 }}>
                      {netWorthAdjustments.slice().reverse().map((adj, idx) => (
                        <li key={idx} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                          <span style={{ color: adj.amount >= 0 ? 'green' : 'red' }}>{adj.amount >= 0 ? '+' : ''}₦{(typeof adj.amount === 'number' && !isNaN(adj.amount) ? adj.amount : 0).toLocaleString()}</span>{' '}
                          <span>[{adj.type ? adj.type.charAt(0).toUpperCase() + adj.type.slice(1) : 'Other'}]</span>{' '}
                          <span>{adj.reason}</span>{' '}
                          <span style={{ color: '#aaa' }}>({new Date(adj.date).toLocaleString()})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Delivery Settings Tab */}
      {activeTab === 'delivery' && (
        <div className="table-data">
          <div className="order" style={{ width: '100%' }}>
            <div className="head">
              <h3>Delivery Settings</h3>
            </div>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
              <label>Base Delivery Fee (₦)
                <input type="number" name="baseDeliveryFee" value={deliverySettings.baseDeliveryFee} onChange={handleSettingsChange} required min="0" />
              </label>
              <label>Rate per Kilometer (₦/km)
                <input type="number" name="deliveryRatePerKm" value={deliverySettings.deliveryRatePerKm} onChange={handleSettingsChange} required min="0" />
              </label>
              <label>Max Delivery Fee Cap (₦, optional)
                <input type="number" name="maxDeliveryFee" value={deliverySettings.maxDeliveryFee} onChange={handleSettingsChange} min="0" />
              </label>
              {settingsError && <p style={{ color: 'red' }}>{settingsError}</p>}
              <button
                type="submit"
                disabled={settingsLoading}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  background: '#3C91E6',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 16,
                  border: 'none',
                  cursor: settingsLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 2px 8px #0001',
                  marginTop: 16
                }}
                onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                onMouseOut={e => e.currentTarget.style.background = '#3C91E6'}
              >
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboardHome; 