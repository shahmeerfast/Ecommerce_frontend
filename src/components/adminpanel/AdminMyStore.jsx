import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { useShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';

const AdminMyStore = () => {
  const { token } = useShopContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product/admin/pending`, {
          headers: { token: localStorage.getItem('token') || token }
        });
        setProducts(response.data.products);
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  const handleApprove = async (productId) => {
    try {
      await axios.put(`/api/product/admin/product/${productId}/status`, 
        { status: 'approved' },
        { headers: { token: localStorage.getItem('token') || token }}
      );
      toast.success('Product approved successfully');
      setProducts(products => products.filter(p => p._id !== productId));
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  const handleReject = async (productId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.put(`/api/product/admin/product/${productId}/status`,
        { status: 'rejected', rejectionReason: reason },
        { headers: { token: localStorage.getItem('token') || token }}
      );
      toast.success('Product rejected successfully');
      setProducts(products => products.filter(p => p._id !== productId));
    } catch (error) {
      toast.error('Failed to reject product');
    }
  };

  return (
    <main>
      <h2 style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 24 }}>Seller Product Approvals</h2>
      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 32 }}>No products pending approval</div>
      ) : (
        <div className="admin-product-grid">
          {products.map(product => (
            <div key={product._id} className="admin-product-card">
              <img src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/200'} alt={product.name} className="admin-product-img" />
              <div className="admin-product-name">{product.name}</div>
              <div className="admin-product-category admin-card-muted">{product.category}</div>
              <div className="admin-product-price">₦{product.price?.toLocaleString()}</div>
              <div className="admin-product-seller admin-card-muted">Seller: {product.sellerName || product.seller || 'Unknown'}</div>
              <div className="admin-product-actions">
                <button onClick={() => handleApprove(product._id)} className="admin-btn-approve">Approve</button>
                <button onClick={() => handleReject(product._id)} className="admin-btn-reject">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminMyStore; 