import React, { useEffect, useState } from 'react'
import { useShopContext } from '../../context/ShopContext'
import { toast } from 'react-toastify'
import axios from '../../config/axios'
import { assets } from '../../assets/assets'

const ReviewModal = ({ open, onClose, productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      axios.get(`/api/product/product/${productId}/reviews`)
        .then(res => {
          setReviews(res.data.reviews || []);
        })
        .catch(() => {
          toast.error('Failed to load reviews');
        })
        .finally(() => setLoading(false));
    }
  }, [open, productId]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        <h3 className="text-lg font-bold mb-4">Reviews for {productName}</h3>
        {loading ? <div>Loading...</div> : (
          reviews.length === 0 ? <div>No reviews yet.</div> : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={i < review.rating ? assets.star_icon : assets.star_dull_icon}
                        alt="star"
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium">
                    {review.user?.fullName && review.user.fullName !== 'Unknown'
                      ? review.user.fullName
                      : review.user?.email || 'User'}
                  </div>
                  <div className="text-gray-600 text-sm">{review.comment}</div>
                  <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

const ProductViewModal = ({ open, onClose, product }) => {
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        <h3 className="text-lg font-bold mb-4">{product.name}</h3>
        <div className="mb-4">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded mb-2" />
          ) : (
            <img src="https://via.placeholder.com/400x400?text=No+Image" alt="No Image" className="w-full h-48 object-cover rounded mb-2" />
          )}
          <div className="text-gray-700 mb-2">Price: <span className="font-semibold">${product.price?.toFixed(2)}</span></div>
          <div className="text-gray-700 mb-2">Category: {product.category}</div>
          <div className="text-gray-700 mb-2">Condition: {product.condition}</div>
          <div className="text-gray-700 mb-2">Description: {product.description}</div>
          {/* Show more images if available */}
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.images.slice(1).map((img, idx) => (
                <img key={idx} src={img} alt={product.name + ' ' + (idx + 2)} className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyListings = () => {
  const { userProducts, deleteProduct } = useShopContext()
  const [modalProduct, setModalProduct] = useState(null);
  const [viewListings, setViewListings] = useState(false);

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Listed Products</h2>
        <button
          onClick={() => setViewListings(v => !v)}
          className="bg-black text-white px-4 py-1 rounded hover:bg-gray-900"
        >
          {viewListings ? 'Hide Listed Products' : 'View Listed Products'}
        </button>
      </div>
      {viewListings && (
        userProducts.length === 0 ? (
          <p>You haven't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProducts.map((product) => (
              <div key={product._id} className="border rounded p-4">
                <img
                  src={
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : 'https://via.placeholder.com/400x400?text=No+Image'
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover mb-2"
                />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">${product.price.toFixed(2)}</p>
                {/* Ratings Summary */}
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(star => (
                    <img
                      key={star}
                      src={star <= (product.averageRating || 0) ? assets.star_icon : assets.star_dull_icon}
                      alt="star"
                      className="w-4 h-4"
                    />
                  ))}
                  <span className="text-xs text-gray-500 pl-1">({product.numReviews || 0})</span>
                </div>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setModalProduct(product)}
                    className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      <ReviewModal
        open={!!modalProduct}
        onClose={() => setModalProduct(null)}
        productId={modalProduct?._id}
        productName={modalProduct?.name}
      />
    </div>
  )
}

export default MyListings