import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const ReviewForm = ({ onSubmit, initialRating = 0, initialComment = '', buttonText = 'Submit Review' }) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex gap-2 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <img
                src={star <= rating ? assets.star_icon : assets.star_dull_icon}
                alt={`${star} star`}
                className="w-5 h-5"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        {buttonText}
      </button>
    </form>
  );
};

const Review = ({ review, onUpdate, onDelete, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ReviewForm
        initialRating={review.rating}
        initialComment={review.comment}
        onSubmit={(data) => {
          onUpdate(data);
          setIsEditing(false);
        }}
        buttonText="Update Review"
      />
    );
  }

  return (
    <div className="border-b py-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{review.user.fullName}</p>
          <div className="flex gap-1 my-1">
            {[...Array(5)].map((_, index) => (
              <img
                key={index}
                src={index < review.rating ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="w-4 h-4"
              />
            ))}
          </div>
          <p className="text-gray-600 mt-2">{review.comment}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        {currentUserId === review.user._id && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart, isAuthenticated, user, token } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const navigate = useNavigate();

  // Clothing-related categories
  const clothingCategories = [
    'clothing', 'men', 'women', 'kids', 'topwear', 'bottomwear', 'winterwear'
  ];

  const fetchProductData = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('\n=== FETCH PRODUCT DEBUG START ===');
      console.log('Product ID:', productId);
      console.log('Retry count:', retryCount);

      if (!productId || productId.length !== 24) {
        throw new Error(`Invalid product ID: ${productId}`);
      }

      const endpoint = `/api/product/product/${productId}`;
      console.log('Making API request to:', endpoint);
      console.log('Full URL:', axios.defaults.baseURL ? axios.defaults.baseURL + endpoint : endpoint);

      try {
        const response = await axios.get(endpoint);
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: JSON.stringify(response.data, null, 2)
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Check if we have debug information
        if (response.data.debug) {
          console.log('Server debug info:', response.data.debug);
        }

        // Handle the case where success is true but product is null
        if (response.data.success && !response.data.product) {
          console.error('Server returned success but no product:', response.data);
          throw new Error(
            response.data.debug 
              ? `Product not found. Debug info: ${JSON.stringify(response.data.debug)}` 
              : 'Product not found in database'
          );
        }

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch product details');
        }

        const product = response.data.product;
        console.log('Raw product data:', JSON.stringify(product, null, 2));

        // Validate required fields
        if (!product._id || !product.name) {
          console.error('Invalid product data:', product);
          throw new Error('Invalid product data: missing required fields');
        }

        // Process images with detailed logging
        console.log('Processing images...');
        console.log('Original images:', product.images);
        const productImages = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : ['https://via.placeholder.com/400x400?text=No+Image'];
        console.log('Processed images:', productImages);

        // Create processed product data
        const processedProduct = {
          _id: product._id,
          name: product.name,
          description: product.description || 'No description available',
          price: typeof product.price === 'number' ? product.price : 0,
          category: product.category || 'Uncategorized',
          subCategory: product.subCategory || product.category || 'Uncategorized',
          sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L'],
          bestseller: Boolean(product.bestseller),
          condition: product.condition || 'new',
          approvalStatus: product.approvalStatus || 'pending',
          images: productImages,
          createdAt: product.createdAt || new Date(),
          approvalDate: product.approvalDate,
          approvedBy: product.approvedBy,
          seller: product.seller
        };

        console.log('Processed product data:', JSON.stringify(processedProduct, null, 2));
        
        setProductData(processedProduct);
        setSelectedImage(productImages[0]);
        
        console.log('Product data set successfully');
        console.log('=== FETCH PRODUCT DEBUG END ===\n');
      } catch (axiosError) {
        console.error('Axios error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            headers: axiosError.config?.headers
          }
        });
        throw axiosError;
      }
    } catch (error) {
      console.error('\n=== FETCH PRODUCT ERROR ===');
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : undefined
      });
      
      // Only retry on network errors or 5xx server errors
      if (retryCount < 2 && (!error.response || error.response?.status >= 500)) {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchProductData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      let errorMessage = error.message;
      if (error.response?.data?.debug) {
        const debug = error.response.data.debug;
        if (debug.totalProducts !== undefined) {
          errorMessage = `${error.message}. Found ${debug.totalProducts} products in database.`;
          if (debug.availableIds) {
            console.log('Available product IDs:', debug.availableIds);
          }
        }
      }

      toast.error(errorMessage);
      setProductData(null);
      console.error('=== FETCH PRODUCT ERROR END ===\n');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/product/product/${productId}/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const handleAddReview = async (reviewData) => {
    try {
      const response = await axios.post(
        `/api/product/product/${productId}/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setReviews(response.data.reviews);
        setShowReviewForm(false);
        toast.success('Review added successfully');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  const handleUpdateReview = async (reviewId, reviewData) => {
    try {
      const response = await axios.put(
        `/api/product/product/${productId}/reviews/${reviewId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setReviews(response.data.reviews);
        toast.success('Review updated successfully');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await axios.delete(
          `/api/product/product/${productId}/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.data.success) {
          setReviews(response.data.reviews);
          toast.success('Review deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
      fetchReviews();
    }
  }, [productId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!productData) {
    return <div className="text-center py-8">Product not found</div>;
  }

  // Ensure sizes is always an array
  const sizes = Array.isArray(productData.sizes) ? productData.sizes : ['S', 'M', 'L'];

  const isClothing = clothingCategories.includes(productData.category?.toLowerCase()) ||
                     clothingCategories.includes(productData.subCategory?.toLowerCase());

  // Badge debug logic (same as ProductItem)
  const sellerLevel = productData.seller?.level;
  const sellerName = productData.seller?.fullName || productData.seller?.name || productData.seller?.email;
  const LEVEL_BADGES = { new: '🌱', trusted: '🤝', premium: '👑' };
  const LEVEL_LABELS = { new: 'New', trusted: 'Trusted', premium: 'Premium' };
  const levelKey = (sellerLevel && LEVEL_BADGES[sellerLevel.toLowerCase()]) ? sellerLevel.toLowerCase() : 'new';
  const badge = LEVEL_BADGES[levelKey];
  const label = LEVEL_LABELS[levelKey];

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.images.map((image, index) => (
              <img
                onClick={() => setSelectedImage(image)}
                src={image}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt={`${productData.name} view ${index + 1}`}
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img 
              className='w-full h-auto' 
              src={selectedImage} 
              alt={productData.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
              }}
            />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={star <= (productData.averageRating || 0) ? assets.star_icon : assets.star_dull_icon}
                alt=""
                className="w-3.5"
              />
            ))}
            <p className='pl-2'>({reviews.length})</p>
          </div>
          {/* Badge */}
          <div className='flex items-center gap-2 mt-2'>
            <span style={{ fontSize: 16 }} title={label}>{badge}</span>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{label}</span>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price.toFixed(2)}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <p className='mt-2 text-gray-500'>Condition: {productData.condition === 'new' ? 'New' :
                                                    productData.condition === 'uk_used' ? 'UK Used' :
                                                    productData.condition === 'used' ? 'Used' :
                                                    productData.condition === 'used_neat' ? 'Used but still very neat' : 'New'}</p>
          {/* Size selection only for clothing categories */}
          {isClothing && (
            <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {sizes.map((item, index) => (
                  <button
                    onClick={() => setSize(item)}
                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (isClothing && !size) {
                toast.warning('Please select a size first');
                return;
              }
              addToCart(productData._id, isClothing ? size : undefined);
            }}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
          {/* Message Seller Button */}
          {isAuthenticated && user?._id !== (productData.seller?._id || productData.seller) && (
            <button
              onClick={() => {
                navigate('/messages', {
                  state: {
                    sellerId: productData.seller?._id || productData.seller,
                    productId: productData._id,
                    productName: productData.name
                  }
                });
              }}
              className='bg-black text-white px-8 py-3 text-sm mt-3 rounded-md hover:bg-gray-800 transition-colors'
            >
              Message Seller
            </button>
          )}
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product</p>
            <p>Cash on delivery is available</p>
            <p>Easy return and exchange within 7 days</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <button
            className={`px-5 py-3 text-sm ${activeTab === 'description' ? 'border-b-2 border-black font-bold' : 'border'}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`px-5 py-3 text-sm ${activeTab === 'reviews' ? 'border-b-2 border-black font-bold' : 'border'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className='border px-6 py-6'>
          {activeTab === 'description' ? (
            <p className='text-sm text-gray-500'>{productData.description}</p>
          ) : (
            <div className='space-y-4'>
              {isAuthenticated ? (
                <div>
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800'
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div>
                      <h3 className='text-lg font-medium mb-2'>Write Your Review</h3>
                      <ReviewForm onSubmit={handleAddReview} />
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className='mt-2 text-gray-600 hover:text-gray-800'
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-gray-600'>
                  Please <a href='/login' className='text-blue-600 hover:text-blue-800'>login</a> to write a review.
                </p>
              )}

              <div className='space-y-4 mt-6'>
                {reviews.map((review) => (
                  <Review
                    key={review._id}
                    review={review}
                    currentUserId={user?._id}
                    onUpdate={(data) => handleUpdateReview(review._id, data)}
                    onDelete={() => handleDeleteReview(review._id)}
                  />
                ))}
                {reviews.length === 0 && (
                  <p className='text-gray-600'>No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {productData.category && productData.subCategory && (
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      )}
    </div>
  );
}

export default Product
