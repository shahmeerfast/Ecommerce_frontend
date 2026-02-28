import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import MyOrders from '../components/profile/MyOrders';
import { useShopContext } from '../context/ShopContext';

const SellerDashboard = () => {
    const { user, setUser } = useShopContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [editingProduct, setEditingProduct] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalValue: 0
    });
    const [imageError, setImageError] = useState({});
    const [showOrders, setShowOrders] = useState(false);

    useEffect(() => {
        fetchSellerProducts();
    }, []);

    const fetchSellerProducts = async () => {
        try {
            console.log('Fetching seller products...');
            console.log('Token:', localStorage.getItem('token'));
            console.log('User:', localStorage.getItem('user'));
            
            const response = await axios.get('/api/product/seller/products', {
                headers: { token: localStorage.getItem('token') }
            });
            
            console.log('Response:', response.data);
            setProducts(response.data.products);
            
            // Calculate statistics
            const stats = response.data.products.reduce((acc, product) => {
                acc.total++;
                acc[product.approvalStatus]++;
                acc.totalValue += product.price;
                return acc;
            }, { total: 0, pending: 0, approved: 0, rejected: 0, totalValue: 0 });
            
            console.log('Calculated stats:', stats);
            setStats(stats);
        } catch (error) {
            console.error('Error fetching products:', error.response || error);
            toast.error(error.response?.data?.message || 'Error fetching your products');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (productId, updatedData) => {
        try {
            await axios.put(`/api/product/seller/update/${productId}`, updatedData, {
                headers: { token: localStorage.getItem('token') }
            });
            toast.success('Product updated successfully');
            fetchSellerProducts();
            setEditingProduct(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await axios.delete(`/api/product/seller/delete/${productId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            toast.success('Product deleted successfully');
            fetchSellerProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting product');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
        // Check for invalid image URLs
        if (!imageUrl || imageUrl.startsWith('data:;base64,') || !imageUrl.startsWith('http')) {
            return 'https://via.placeholder.com/300x200?text=Invalid+Image';
        }
        
        // Handle relative URLs
        if (imageUrl.startsWith('/')) {
            return `${axios.defaults.baseURL}${imageUrl}`;
        }
        return imageUrl;
    };

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filter === 'all' || product.approvalStatus === filter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'priceHigh') return b.price - a.price;
            if (sortBy === 'priceLow') return a.price - b.price;
            return 0;
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                <div className="flex gap-2">
                <Link
                    to="/add-product"
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                >
                    Add New Product
                </Link>
                    <button
                        className={`px-6 py-2 rounded-lg ${showOrders ? 'bg-gray-800 text-white' : 'bg-white text-black border'}`}
                        onClick={() => setShowOrders((prev) => !prev)}
                    >
                        {showOrders ? 'Back to Products' : 'My Orders'}
                    </button>
                </div>
            </div>

            {showOrders ? (
                <MyOrders />
            ) : (
                <>
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 capitalize">
                            {key === 'totalValue' ? 'Total Value' : key}
                        </h3>
                        <p className="text-2xl font-bold">
                            {key === 'totalValue' ? `₦${value.toLocaleString()}` : value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
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
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceHigh">Price High to Low</option>
                    <option value="priceLow">Price Low to High</option>
                </select>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="border rounded-lg p-4 shadow-sm">
                            {editingProduct === product._id ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => setProducts(products.map(p => 
                                            p._id === product._id ? {...p, name: e.target.value} : p
                                        ))}
                                        className="w-full p-2 border rounded"
                                    />
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => setProducts(products.map(p => 
                                            p._id === product._id ? {...p, description: e.target.value} : p
                                        ))}
                                        className="w-full p-2 border rounded"
                                    />
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => setProducts(products.map(p => 
                                            p._id === product._id ? {...p, price: parseFloat(e.target.value)} : p
                                        ))}
                                        className="w-full p-2 border rounded"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateProduct(product._id, product)}
                                            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingProduct(null)}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                    <p className="text-lg font-bold mb-2">₦{product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-500">
                                            Condition: {product.condition === 'new' ? 'New' :
                                                      product.condition === 'uk_used' ? 'UK Used' :
                                                      product.condition === 'used' ? 'Used' :
                                                      product.condition === 'used_neat' ? 'Used but still very neat' : 'New'}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                                                product.approvalStatus
                                            )}`}
                                        >
                                            {product.approvalStatus}
                                        </span>
                                    </div>
                                    
                                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                        <div className="mt-4 p-3 bg-red-50 rounded-lg mb-4">
                                            <p className="text-sm text-red-700">
                                                <span className="font-semibold">Rejection Reason:</span>{' '}
                                                {product.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingProduct(product._id)}
                                            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SellerDashboard;