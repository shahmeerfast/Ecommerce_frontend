import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({
        totalPayouts: 0,
        totalAmount: 0,
        byStatus: {}
    });
    const [loading, setLoading] = useState(true);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [payoutMethod, setPayoutMethod] = useState('manual');
    const [notes, setNotes] = useState('');
    const [payoutReference, setPayoutReference] = useState('');
    const [showBankModal, setShowBankModal] = useState(false);

    useEffect(() => {
        fetchPayouts();
        fetchStats();
    }, [filter]);

    const fetchPayouts = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`/api/payment-distribution/admin/all?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayouts(Array.isArray(response.data.payouts) ? response.data.payouts : []);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/api/payment-distribution/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprovePayout = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('/api/payment-distribution/admin/approve', {
                payoutId: selectedPayout._id,
                payoutMethod,
                notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Payout approved successfully');
            setShowApproveModal(false);
            setSelectedPayout(null);
            setPayoutMethod('manual');
            setNotes('');
            fetchPayouts();
            fetchStats();
        } catch (error) {
            console.error('Error approving payout:', error);
            toast.error('Failed to approve payout');
        }
    };

    const handleMarkAsPaid = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('/api/payment-distribution/admin/mark-paid', {
                payoutId: selectedPayout._id,
                payoutReference,
                notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Payout marked as paid successfully');
            setShowPayModal(false);
            setSelectedPayout(null);
            setPayoutReference('');
            setNotes('');
            fetchPayouts();
            fetchStats();
        } catch (error) {
            console.error('Error marking payout as paid:', error);
            toast.error('Failed to mark payout as paid');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'approved': return 'text-blue-600 bg-blue-100';
            case 'paid': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'cancelled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Distribution</h1>
                <p className="text-gray-600">Manage seller payouts and commission distribution</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Payouts</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats?.totalPayouts ?? 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalAmount ?? 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.pending?.count ?? 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Paid Payouts</h3>
                    <p className="text-2xl font-bold text-green-600">{stats?.byStatus?.paid?.count ?? 0}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All Payouts</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Seller
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(payouts || []).map((payout) => (
                                <tr key={payout._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {payout.sellerName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payout.sellerId?.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            Order #{payout.orderId?._id?.slice(-8)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatCurrency(payout.orderId?.amount || 0)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(payout.payoutAmount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Commission: {formatCurrency(payout.commission)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                                            {payout.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(payout.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {payout.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPayout(payout);
                                                    setShowApproveModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {payout.status === 'approved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPayout(payout);
                                                    setShowPayModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedPayout(payout);
                                                setShowBankModal(true);
                                            }}
                                            className="text-black bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 font-semibold mr-3"
                                        >
                                            View Bank Details
                                        </button>
                                        {/* Mark as Failed button */}
                                        {['pending', 'approved'].includes(payout.status) && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to mark this payout as FAILED?')) {
                                                        try {
                                                            const token = localStorage.getItem('adminToken');
                                                            await axios.post('/api/payment-distribution/admin/mark-failed', {
                                                                payoutId: payout._id
                                                            }, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            toast.success('Payout marked as failed');
                                                            fetchPayouts();
                                                            fetchStats();
                                                        } catch (error) {
                                                            toast.error('Failed to mark payout as failed');
                                                        }
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900 mr-3"
                                            >
                                                Mark as Failed
                                            </button>
                                        )}
                                        {/* Cancel button */}
                                        {['pending', 'approved'].includes(payout.status) && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to CANCEL this payout?')) {
                                                        try {
                                                            const token = localStorage.getItem('adminToken');
                                                            await axios.post('/api/payment-distribution/admin/mark-cancelled', {
                                                                payoutId: payout._id
                                                            }, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                            toast.success('Payout cancelled');
                                                            fetchPayouts();
                                                            fetchStats();
                                                        } catch (error) {
                                                            toast.error('Failed to cancel payout');
                                                        }
                                                    }
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedPayout && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Payout</h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Approve payout of {formatCurrency(selectedPayout.payoutAmount)} to {selectedPayout.sellerName}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payout Method
                                </label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="manual">Manual Transfer</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="stripe_connect">Stripe Connect</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add any notes about this payout..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprovePayout}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Paid Modal */}
            {showPayModal && selectedPayout && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Mark Payout as Paid</h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Mark payout of {formatCurrency(selectedPayout.payoutAmount)} to {selectedPayout.sellerName} as paid
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Reference
                                </label>
                                <input
                                    type="text"
                                    value={payoutReference}
                                    onChange={(e) => setPayoutReference(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Transaction ID, reference number, etc."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add any notes about this payment..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMarkAsPaid}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Mark as Paid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Details Modal */}
            {showBankModal && selectedPayout && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            onClick={() => setShowBankModal(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Seller Bank Details</h2>
                        {selectedPayout.sellerId?.bankDetails ? (
                            <div className="space-y-2">
                                <div><span className="font-semibold">Account Holder Name:</span> {selectedPayout.sellerId.bankDetails.accountHolderName || '-'}</div>
                                <div><span className="font-semibold">Bank Name:</span> {selectedPayout.sellerId.bankDetails.bankName || '-'}</div>
                                <div><span className="font-semibold">Account Number:</span> {selectedPayout.sellerId.bankDetails.accountNumber || '-'}</div>
                                <div><span className="font-semibold">Bank Branch:</span> {selectedPayout.sellerId.bankDetails.bankBranch || '-'}</div>
                                <div><span className="font-semibold">IFSC/SWIFT Code:</span> {selectedPayout.sellerId.bankDetails.ifscSwiftCode || '-'}</div>
                                <div><span className="font-semibold">Bank Country:</span> {selectedPayout.sellerId.bankDetails.bankCountry || '-'}</div>
                            </div>
                        ) : (
                            <div className="text-gray-500">No bank details available for this seller.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayouts; 