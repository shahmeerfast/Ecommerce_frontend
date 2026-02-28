import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useShopContext } from '../context/ShopContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useShopContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [imageError, setImageError] = useState({});
    const [deliverySettings, setDeliverySettings] = useState({
        baseDeliveryFee: '',
        deliveryRatePerKm: '',
        maxDeliveryFee: ''
    });
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [settingsError, setSettingsError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activityLogs, setActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [netWorth, setNetWorth] = useState(0);
    const [netWorthAdjustments, setNetWorthAdjustments] = useState([]);
    const [netWorthLoading, setNetWorthLoading] = useState(true);
    const [netWorthError, setNetWorthError] = useState('');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [adjustType, setAdjustType] = useState('other');

    // Check if user is admin
    useEffect(() => {
        if (!token || !user || user.role !== 'admin') {
            toast.error('Access denied. Admin only area.');
            navigate('/login');
        }
    }, [token, user, navigate]);

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, [filter]);

    useEffect(() => {
        // Fetch delivery settings
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
        fetchSettings();
    }, []);

    // Fetch company net worth
    useEffect(() => {
        if (user && user.role === 'admin') {
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
            fetchNetWorth();
        }
    }, [user, token]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/product/admin/${filter}`, {
                headers: { token: localStorage.getItem('token') }
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
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveProduct = async (productId) => {
        try {
            await axios.put(`/api/product/admin/product/${productId}/status`, 
                { status: 'approved' },
                { headers: { token: localStorage.getItem('token') }}
            );
            toast.success('Product approved successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error approving product:', error);
            toast.error('Failed to approve product');
        }
    };

    const handleRejectProduct = async (productId, reason) => {
        try {
            await axios.put(`/api/product/admin/product/${productId}/status`,
                { 
                    status: 'rejected',
                    rejectionReason: reason
                },
                { headers: { token: localStorage.getItem('token') }}
            );
            toast.success('Product rejected successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error rejecting product:', error);
            toast.error('Failed to reject product');
        }
    };

    const handleImageError = (productId) => {
        setImageError(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const getImageUrl = (product) => {
        if (!product.images || !product.images.length || imageError[product._id]) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
        }
        
        const imageUrl = product.images[0];
        if (!imageUrl || imageUrl.startsWith('data:;base64,') || !imageUrl.startsWith('http')) {
            return 'https://via.placeholder.com/300x200?text=Invalid+Image';
        }
        
        return imageUrl;
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        } finally {
            setSettingsLoading(false);
        }
    };

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

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchActivityLogs();
        }
    }, [activeTab]);

    const handleNetWorthAdjust = async (e) => {
        e.preventDefault();
        if (!adjustAmount || !adjustReason) return;
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
        } finally {
            setAdjustLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            {/* Tab Switcher */}
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-black text-white' : 'bg-gray-200'}`}>Dashboard</button>
                <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded ${activeTab === 'activity' ? 'bg-black text-white' : 'bg-gray-200'}`}>Activity & Transaction History</button>
                {user && user.role === 'admin' && (
                    <>
                        <button onClick={() => setActiveTab('networth')} className={`px-4 py-2 rounded ${activeTab === 'networth' ? 'bg-black text-white' : 'bg-gray-200'}`}>Company Net Worth</button>
                        <button onClick={() => setActiveTab('delivery')} className={`px-4 py-2 rounded ${activeTab === 'delivery' ? 'bg-black text-white' : 'bg-gray-200'}`}>Delivery Settings</button>
                    </>
                )}
            </div>
            {activeTab === 'delivery' && user && user.role === 'admin' && (
                <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-xl">
                    <h2 className="text-xl font-semibold mb-4">Delivery Settings</h2>
                    <form onSubmit={saveSettings} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Base Delivery Fee (₦)</label>
                            <input
                                type="number"
                                name="baseDeliveryFee"
                                value={deliverySettings.baseDeliveryFee}
                                onChange={handleSettingsChange}
                                className="input-field"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Rate per Kilometer (₦/km)</label>
                            <input
                                type="number"
                                name="deliveryRatePerKm"
                                value={deliverySettings.deliveryRatePerKm}
                                onChange={handleSettingsChange}
                                className="input-field"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Max Delivery Fee Cap (₦, optional)</label>
                            <input
                                type="number"
                                name="maxDeliveryFee"
                                value={deliverySettings.maxDeliveryFee}
                                onChange={handleSettingsChange}
                                className="input-field"
                                min="0"
                            />
                        </div>
                        {settingsError && <p className="text-red-500">{settingsError}</p>}
                        <button
                            type="submit"
                            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                            disabled={settingsLoading}
                        >
                            {settingsLoading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </div>
            )}
            {activeTab === 'networth' && user && user.role === 'admin' && (
                <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-xl">
                    <h2 className="text-xl font-semibold mb-4">Company Net Worth</h2>
                    {netWorthLoading ? (
                        <div>Loading...</div>
                    ) : netWorthError ? (
                        <div className="text-red-500">{netWorthError}</div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <span className="font-bold text-2xl">₦{(typeof netWorth === 'number' && !isNaN(netWorth) ? netWorth : 0).toLocaleString()}</span>
                            </div>
                            <form onSubmit={handleNetWorthAdjust} className="flex flex-col gap-2 mb-4">
                                <div className="flex gap-2">
                                    <select
                                        value={adjustType}
                                        onChange={e => setAdjustType(e.target.value)}
                                        className="input-field flex-1"
                                        required
                                    >
                                        <option value="refund">Refund</option>
                                        <option value="salary">Salary</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Amount (₦)"
                                        value={adjustAmount}
                                        onChange={e => setAdjustAmount(e.target.value)}
                                        className="input-field flex-1"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Reason"
                                        value={adjustReason}
                                        onChange={e => setAdjustReason(e.target.value)}
                                        className="input-field flex-1"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                        disabled={adjustLoading}
                                    >
                                        {adjustLoading ? 'Saving...' : 'Adjust'}
                                    </button>
                                </div>
                                <span className="text-xs text-gray-500">Use negative amount for deductions (e.g., refunds, salaries).</span>
                            </form>
                            <div>
                                <h3 className="font-semibold mb-2">Manual Adjustments</h3>
                                {netWorthAdjustments.length === 0 ? (
                                    <div className="text-gray-500">No manual adjustments yet.</div>
                                ) : (
                                    <ul className="max-h-40 overflow-y-auto text-sm">
                                        {netWorthAdjustments.slice().reverse().map((adj, idx) => (
                                            <li key={idx} className="mb-1 border-b pb-1">
                                                <span className={adj.amount >= 0 ? 'text-green-700' : 'text-red-700'}>
                                                    {adj.amount >= 0 ? '+' : ''}₦{(typeof adj.amount === 'number' && !isNaN(adj.amount) ? adj.amount : 0).toLocaleString()}
                                                </span>{' '}
                                                <span className="text-gray-700">[{adj.type ? adj.type.charAt(0).toUpperCase() + adj.type.slice(1) : 'Other'}]</span>{' '}
                                                <span className="text-gray-700">{adj.reason}</span>{' '}
                                                <span className="text-gray-400">({new Date(adj.date).toLocaleString()})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
            {activeTab === 'dashboard' && (
                <>
                {/* Dashboard content here, but no Delivery Settings */}
                </>
            )}
            {activeTab === 'activity' && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Activity & Transaction History</h2>
                    {logsLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Description</th>
                                        <th className="px-4 py-2">User</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Date/Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLogs.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8">No activity found.</td></tr>
                                    ) : (
                                        activityLogs.map(log => (
                                            <tr key={log._id} className="border-b">
                                                <td className="px-4 py-2">{log.actionType}</td>
                                                <td className="px-4 py-2">{log.description}</td>
                                                <td className="px-4 py-2">{log.userName || (log.userModel ? `${log.userModel}: ${log.user || ''}` : '')}</td>
                                                <td className="px-4 py-2">{log.status || '-'}</td>
                                                <td className="px-4 py-2">{log.amount ? `₦${log.amount}` : '-'}</td>
                                                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 capitalize">{key}</h3>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All Products</option>
                </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="border rounded-lg p-4 shadow-sm">
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                                <img
                                    src={getImageUrl(product)}
                                    alt={product.name}
                                    className="object-cover rounded-lg w-full h-48"
                                    onError={() => handleImageError(product._id)}
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <p className="text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
                            
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">
                                    Category: {product.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {product.approvalStatus}
                                </span>
                            </div>

                            {product.approvalStatus === 'pending' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApproveProduct(product._id)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = window.prompt('Enter rejection reason:');
                                            if (reason) handleRejectProduct(product._id, reason);
                                        }}
                                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-semibold">Rejection Reason:</span>{' '}
                                        {product.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;