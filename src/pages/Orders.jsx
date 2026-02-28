import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderItem = ({ item, currency }) => {
  const { backendUrl } = useContext(ShopContext);
  const [imageError, setImageError] = useState(false);

  // Function to get the correct image URL
  const getImageUrl = (imageSource) => {
    console.log('Getting image URL for:', imageSource);
    
    if (!imageSource) {
      console.log('No image source provided');
      return '/placeholder.png';
    }
    
    // If it's an array, take the first non-null image
    if (Array.isArray(imageSource)) {
      console.log('Image source is an array:', imageSource);
      const validImage = imageSource.find(img => img && typeof img === 'string');
      if (!validImage) {
        console.log('No valid image found in array');
        return '/placeholder.png';
      }
      imageSource = validImage;
    }

    // Handle string image source
    if (typeof imageSource !== 'string') {
      console.log('Invalid image source type:', typeof imageSource);
      return '/placeholder.png';
    }

    // If the image path is a full URL or data URL, use it as is
    if (imageSource.startsWith('http') || imageSource.startsWith('data:') || imageSource.startsWith('blob:')) {
      console.log('Using full URL:', imageSource);
      return imageSource;
    }
    
    // If it's a relative path, prepend the backend URL
    // Remove any leading slashes to avoid double slashes
    const cleanPath = imageSource.startsWith('/') ? imageSource.substring(1) : imageSource;
    const fullUrl = `${backendUrl}/${cleanPath}`;
    console.log('Constructed full URL:', fullUrl);
    return fullUrl;
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', {
      originalSrc: e.target.src,
      itemImage: item.image,
      backendUrl
    });
    setImageError(true);
    e.target.src = '/placeholder.png';
  };

  return (
    <div className='flex flex-col sm:flex-row items-start border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow'>
      <div className='w-full sm:w-48 h-48 mb-4 sm:mb-0 flex-shrink-0 relative'>
        {imageError ? (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border'>
            <span className='text-sm text-gray-500'>Image not available</span>
          </div>
        ) : (
          <img 
            className='w-full h-full object-contain rounded-lg border bg-gray-50' 
            src={getImageUrl(item.image)}
            alt={item.name}
            onError={handleImageError}
          />
        )}
      </div>
      <div className='sm:ml-6 flex-grow'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2'>{item.name}</h3>
        <div className='space-y-3'>
          <p className='text-2xl font-bold text-gray-900'>{currency}{parseFloat(item.price).toFixed(2)}</p>
          <div className='flex flex-wrap gap-4 text-sm'>
            <div className='bg-gray-100 px-3 py-1 rounded-full'>
              <span className='text-gray-600'>Size: </span>
              <span className='font-medium text-gray-900'>{item.size}</span>
            </div>
            <div className='bg-gray-100 px-3 py-1 rounded-full'>
              <span className='text-gray-600'>Quantity: </span>
              <span className='font-medium text-gray-900'>{item.quantity}</span>
            </div>
            <div className='bg-gray-100 px-3 py-1 rounded-full'>
              <span className='text-gray-600'>Total: </span>
              <span className='font-medium text-gray-900'>{currency}{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className='mt-2 text-xs text-gray-400 space-y-1'>
              <p>Image data: {JSON.stringify(item.image)}</p>
              <p>Backend URL: {backendUrl}</p>
              <p>Full image URL: {getImageUrl(item.image)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({ order, currency, onReceiptConfirmed }) => {
  const { backendUrl, token, user } = useContext(ShopContext);
  const [imageErrors, setImageErrors] = useState({});
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

  // Add debug logging for order data
  useEffect(() => {
    console.log('Order data:', {
      orderId: order._id,
      items: order.items,
      itemsCount: order.items?.length || 0
    });

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity
        });
      });
    }
  }, [order]);

  const statusColors = {
    'Order Placed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
    'Delivered': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200'
  };

  // Function to get the correct image URL
  const getImageUrl = (imageSource) => {
    console.log('Getting image URL for:', imageSource);
    
    if (!imageSource) {
      console.log('No image source provided');
      return '/placeholder.png';
    }

    // If it's already a full URL (which it should be from order creation), use it as is
    if (imageSource.startsWith('http') || imageSource.startsWith('data:') || imageSource.startsWith('blob:') || imageSource.startsWith(backendUrl)) {
      console.log('Using existing full URL:', imageSource);
      return imageSource;
    }

    // If somehow we got a relative path, construct the full URL
    const cleanPath = imageSource.startsWith('/') ? imageSource.substring(1) : imageSource;
    const fullUrl = `${backendUrl}/${cleanPath}`;
    console.log('Constructed full URL:', fullUrl);
    return fullUrl;
  };

  const handleImageError = (index) => {
    console.log('Image load error for index:', index, {
      item: order.items[index],
      backendUrl
    });
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handleConfirmReceipt = async () => {
    if (!window.confirm('Are you sure you want to confirm receipt of this order? This will schedule payment release to the seller after 24 hours.')) {
      return;
    }

    setConfirmingReceipt(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/confirm-receipt`,
        { orderId: order._id },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Call the callback to refresh the order data
        if (onReceiptConfirmed) {
          onReceiptConfirmed(order._id);
        }
      } else {
        toast.error(response.data.message || 'Failed to confirm receipt');
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  // Check if order is eligible for receipt confirmation
  const canConfirmReceipt = order.status === 'Delivered' && !order.receiptConfirmed;
  
  // Check if payment release is scheduled
  const isPaymentReleaseScheduled = order.receiptConfirmed && order.paymentReleaseScheduled;

  return (
    <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
      {/* Order Header */}
      <div className='px-6 py-4 border-b bg-gray-50'>
        <div className='flex flex-wrap gap-4 justify-between items-start'>
          <div>
            <p className='text-sm text-gray-500 mb-1'>Order ID</p>
            <h2 className='text-lg font-semibold text-gray-900'>
              #{order._id}
            </h2>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500 mb-1'>Order Date</p>
            <p className='font-medium'>
              {new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500 mb-1'>Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              {order.status}
            </span>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500 mb-1'>Payment Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${order.payment ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
              {order.payment ? 'Paid' : 'Payment Pending'}
            </span>
          </div>
        </div>
        
        {/* Receipt Confirmation Status */}
        {order.status === 'Delivered' && (
          <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className='text-sm text-blue-800'>
                  {order.receiptConfirmed 
                    ? 'Receipt confirmed! Payment will be released to seller after 24 hours.'
                    : 'Please confirm receipt of your order to release payment to seller.'
                  }
                </span>
              </div>
              
              {canConfirmReceipt && (
                <button
                  onClick={handleConfirmReceipt}
                  disabled={confirmingReceipt}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    confirmingReceipt
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {confirmingReceipt ? 'Confirming...' : 'Received & Confirmed'}
                </button>
              )}
              
              {isPaymentReleaseScheduled && order.paymentReleaseDate && (
                <div className='text-right'>
                  <p className='text-xs text-blue-600'>
                    Payment Release: {new Date(order.paymentReleaseDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className='p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Product Images */}
          <div className='bg-gray-50 rounded-lg p-6'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4'>
              Products ({order.items?.length || 0})
            </h3>
            <div className='flex flex-wrap gap-4'>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className='relative w-24 h-24 rounded-lg border bg-white overflow-hidden'>
                    {imageErrors[index] ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                        <span className='text-xs text-gray-500'>No image</span>
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className='w-full h-full object-contain p-2'
                        onError={() => handleImageError(index)}
                      />
                    )}
                    <div className='absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 text-white text-xs px-1'>
                      {item.quantity}
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                      <div className='absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[8px] p-0.5 truncate'>
                        {item.image}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='w-full text-center text-sm text-gray-500'>
                  No items in this order
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className='bg-gray-50 rounded-lg p-6'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4'>
              Payment Information
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-600'>Method</span>
                <span className='font-medium text-gray-900'>{order.paymentMethod}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-600'>Subtotal</span>
                <span className='font-medium text-gray-900'>{currency}{parseFloat(order.amount).toFixed(2)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-600'>Shipping</span>
                <span className='font-medium text-gray-900'>{order.deliveryFee ? `₦${order.deliveryFee}` : 'Free'}</span>
              </div>
              <div className='pt-3 border-t'>
                <div className='flex justify-between items-center'>
                  <span className='font-semibold text-gray-900'>Total</span>
                  <span className='text-xl font-bold text-gray-900'>{currency}{((parseFloat(order.amount) || 0) + (parseFloat(order.deliveryFee) || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className='bg-gray-50 rounded-lg p-6 md:col-span-2'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4'>
              Delivery Address
            </h3>
            <div className='space-y-3'>
              <p className='font-medium text-gray-900'>
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className='text-sm text-gray-600 space-y-1'>
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}
                  {order.address.state && `, ${order.address.state}`} {order.address.zipcode}
                </p>
                <p>{order.address.country}</p>
              </div>
              <div className='pt-2 flex items-center gap-2 text-sm'>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className='text-gray-900 font-medium'>{order.address.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const { backendUrl, token, currency, user } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrderData = async () => {
    setError(null);
    try {
      if (!token || !user?._id) {
        console.log('No token or user ID found:', { token: !!token, userId: user?._id });
        setLoading(false);
        setError('Please log in to view your orders');
        return;
      }

      console.log('Fetching orders for user:', user._id);
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        { userId: user._id },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order API response:', response.data);

      if (response.data.success) {
        const ordersData = response.data.orders || [];
        console.log('Raw orders data:', JSON.stringify(ordersData, null, 2));
        
        // Sort orders by date in descending order (most recent first)
        const sortedOrders = ordersData.sort((a, b) => b.date - a.date);
        setOrders(sortedOrders);
      } else {
        console.log('Failed to fetch orders:', response.data);
        setError(response.data.message || 'Failed to load orders');
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load orders');
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle receipt confirmation
  const handleReceiptConfirmed = async (orderId) => {
    try {
      // Reload the specific order data to get updated status
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        { userId: user._id },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const ordersData = response.data.orders || [];
        const sortedOrders = ordersData.sort((a, b) => b.date - a.date);
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error refreshing order data:', error);
      // Fallback: reload all orders
      loadOrderData();
    }
  };

  useEffect(() => {
    if (user?._id) {
      console.log('User ID changed, reloading orders:', user._id);
      loadOrderData();
    }
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your orders.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={loadOrderData} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No orders found.</p>
        <button 
          onClick={loadOrderData} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Orders
        </button>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className="space-y-8">
        {orders.map((order) => (
          <OrderSummary 
            key={order._id} 
            order={order}
            currency={currency}
            onReceiptConfirmed={(orderId) => {
              // This function will be called when a receipt is confirmed.
              // It can be used to update the specific order in the orders array.
              // For now, we'll just reload all orders to show the updated status.
              handleReceiptConfirmed(orderId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Orders;
