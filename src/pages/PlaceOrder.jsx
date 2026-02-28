import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useShopContext } from '../context/ShopContext'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, getShippingFee, products, user, setUser } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const [deliveryInfo, setDeliveryInfo] = useState({
        deliveryAddress: '',
        deliveryLat: '',
        deliveryLng: '',
        deliveryDistanceKm: '',
        deliveryFee: '',
        calculating: false
    });

    const [deliveryError, setDeliveryError] = useState('');

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    };

    const calculateDeliveryFee = async () => {
        setDeliveryInfo(prev => ({ ...prev, calculating: true }));
        setDeliveryError('');
        try {
            // Assume first product's seller for single-vendor cart
            const firstProduct = products.find(p => cartItems[p._id]?.quantity > 0);
            console.log('First product in cart:', firstProduct);
            let sellerId = null;
            if (firstProduct) {
                sellerId = firstProduct.sellerId || firstProduct.seller?._id || firstProduct.seller;
            }
            // Fallback: Try to fetch product details from backend if sellerId is missing
            if (!sellerId && firstProduct && firstProduct._id) {
                try {
                    const res = await axios.get(`${backendUrl}/api/product/product/${firstProduct._id}`);
                    const prod = res.data.product;
                    sellerId = prod.sellerId || prod.seller?._id || prod.seller;
                    if (sellerId) {
                        console.log('Fetched sellerId from backend:', sellerId);
                    }
                } catch (fetchErr) {
                    console.warn('Failed to fetch product for sellerId fallback:', fetchErr);
                }
            }
            if (!sellerId) {
                setDeliveryError('Seller info missing (no sellerId on product, even after backend fetch)');
                setDeliveryInfo(prev => ({ ...prev, calculating: false }));
                return;
            }
            const res = await axios.post(backendUrl + '/api/order/calculate-delivery-fee', {
                sellerId,
                deliveryLat: Number(deliveryInfo.deliveryLat),
                deliveryLng: Number(deliveryInfo.deliveryLng)
            });
            setDeliveryInfo(prev => ({
                ...prev,
                deliveryDistanceKm: res.data.distance,
                deliveryFee: res.data.fee,
                calculating: false
            }));
        } catch (err) {
            setDeliveryError('Failed to calculate delivery fee');
            setDeliveryInfo(prev => ({ ...prev, calculating: false }));
        }
    };

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log(response)
                try {
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay',response,{headers:{token}})
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error)
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        // Prevent order if any delivery info is missing
        if (
            !deliveryInfo.deliveryAddress ||
            !deliveryInfo.deliveryLat ||
            !deliveryInfo.deliveryLng ||
            !deliveryInfo.deliveryDistanceKm ||
            !deliveryInfo.deliveryFee
        ) {
            toast.error('Please fill in all delivery details and calculate the delivery fee before placing the order.');
            return;
        }
        try {
            if (!user || !user._id) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
            }

            console.log('Cart Items:', cartItems);
            console.log('Products:', products);

            let orderItems = [];

            // Process cart items with new structure
            Object.entries(cartItems).forEach(([productId, itemData]) => {
                if (itemData.quantity > 0) {
                    const product = products.find(p => p._id === productId);
                    
                    if (product) {
                        console.log('Processing product:', {
                            id: product._id,
                            name: product.name,
                            quantity: itemData.quantity,
                            size: itemData.size
                        });

                        // Create order item with all necessary fields
                        const orderItem = {
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            quantity: itemData.quantity,
                            size: itemData.size,
                            description: product.description || '',
                            image: (() => {
                                // Get all possible image sources
                                const possibleImages = [
                                    product.image,
                                    product.imageUrl,
                                    Array.isArray(product.images) ? product.images[0] : product.images,
                                    Array.isArray(product.imageUrls) ? product.imageUrls[0] : product.imageUrls
                                ].filter(img => img && typeof img === 'string');

                                console.log('Available images for product:', {
                                    productId: product._id,
                                    images: possibleImages
                                });

                                const imageUrl = possibleImages[0];
                                if (!imageUrl) {
                                    console.warn('No valid image found for product:', product._id);
                                    return '/placeholder.png';
                                }

                                // If it's already a full URL, use it as is
                                if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
                                    return imageUrl;
                                }

                                // Otherwise, construct the full URL
                                const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
                                return `${backendUrl}/${cleanPath}`;
                            })()
                        };

                        console.log('Created order item:', orderItem);
                        orderItems.push(orderItem);
                    } else {
                        console.warn('Product not found:', productId);
                    }
                }
            });

            console.log('Final order items:', orderItems);

            if (orderItems.length === 0) {
                toast.error('Your cart is empty');
                return;
            }

            const subtotal = getCartAmount();
            const shippingFee = getShippingFee();
            const totalAmount = subtotal + shippingFee;

            const orderData = {
                userId: user._id,
                address: formData,
                items: orderItems,
                amount: totalAmount,
                // Delivery info
                deliveryAddress: deliveryInfo.deliveryAddress,
                deliveryLat: deliveryInfo.deliveryLat,
                deliveryLng: deliveryInfo.deliveryLng,
                deliveryDistanceKm: deliveryInfo.deliveryDistanceKm,
                deliveryFee: deliveryInfo.deliveryFee
            };

            console.log('Sending order data:', orderData);

            switch (method) {
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place', orderData, {
                        headers: {
                            token,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.data.success) {
                        setCartItems({})
                        // Fetch latest user profile after order
                        try {
                            const profileRes = await axios.get(backendUrl + '/api/user/profile', {
                                headers: { token }
                            });
                            if (profileRes.data && profileRes.data.success) {
                                setUser(profileRes.data.user);
                                localStorage.setItem('user', JSON.stringify(profileRes.data.user));
                            }
                        } catch (err) {
                            // Ignore profile fetch errors
                        }
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {
                        headers: {
                            token,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (responseStripe.data.success) {
                        // Store breakdown in sessionStorage for Verify page
                        if (responseStripe.data.breakdown) {
                            sessionStorage.setItem('stripeBreakdown', JSON.stringify(responseStripe.data.breakdown));
                        }
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':
                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {
                        headers: {
                            token,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order)
                    }
                    break;

                default:
                    break;
            }

        } catch (error) {
            console.log('Order error:', error.response?.data || error);
            toast.error(error.response?.data?.message || error.message || 'Failed to place order');
        }
    }

    return (
        <div className='border-t pt-14'>
            <div className='text-2xl mb-3'>
                <Title text1={'PLACE'} text2={'ORDER'} />
            </div>

            <div className='flex flex-col lg:flex-row gap-10'>
                <form onSubmit={onSubmitHandler} className='flex-1'>
                    <div className='flex flex-col gap-3'>
                        <input
                            type="text"
                            name='firstName'
                            value={formData.firstName}
                            onChange={onChangeHandler}
                            placeholder='First Name'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='lastName'
                            value={formData.lastName}
                            onChange={onChangeHandler}
                            placeholder='Last Name'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="email"
                            name='email'
                            value={formData.email}
                            onChange={onChangeHandler}
                            placeholder='Email'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='phone'
                            value={formData.phone}
                            onChange={onChangeHandler}
                            placeholder='Phone'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='street'
                            value={formData.street}
                            onChange={onChangeHandler}
                            placeholder='Street'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='city'
                            value={formData.city}
                            onChange={onChangeHandler}
                            placeholder='City'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='state'
                            value={formData.state}
                            onChange={onChangeHandler}
                            placeholder='State'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='zipcode'
                            value={formData.zipcode}
                            onChange={onChangeHandler}
                            placeholder='Zipcode'
                            required
                            className='border px-3 py-2'
                        />
                        <input
                            type="text"
                            name='country'
                            value={formData.country}
                            onChange={onChangeHandler}
                            placeholder='Country'
                            required
                            className='border px-3 py-2'
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Delivery Address</h3>
                        <input
                            type="text"
                            name="deliveryAddress"
                            placeholder="Delivery Address"
                            value={deliveryInfo.deliveryAddress}
                            onChange={handleDeliveryChange}
                            className="input-field"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="deliveryLat"
                                placeholder="Latitude"
                                value={deliveryInfo.deliveryLat}
                                onChange={handleDeliveryChange}
                                className="input-field"
                                required
                                step="any"
                            />
                            <input
                                type="number"
                                name="deliveryLng"
                                placeholder="Longitude"
                                value={deliveryInfo.deliveryLng}
                                onChange={handleDeliveryChange}
                                className="input-field"
                                required
                                step="any"
                            />
                            <button type="button" onClick={calculateDeliveryFee} className="bg-black text-white px-4 py-2 rounded mt-2">
                                {deliveryInfo.calculating ? 'Calculating...' : 'Calculate Delivery Fee'}
                            </button>
                        </div>
                        {deliveryError && <p className="text-red-500">{deliveryError}</p>}
                        {deliveryInfo.deliveryFee && (
                            <div className="mt-2 text-green-700">
                                <p>Distance: {deliveryInfo.deliveryDistanceKm} km</p>
                                <p>Delivery Fee: ₦{deliveryInfo.deliveryFee}</p>
                            </div>
                        )}
                    </div>

                    <div className='mt-10'>
                        <p className='font-medium'>Payment Method</p>
                        <div className='flex gap-5 mt-3'>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="radio"
                                    name="payment"
                                    id="cod"
                                    checked={method === 'cod'}
                                    onChange={() => setMethod('cod')}
                                />
                                <label htmlFor="cod">Cash on Delivery</label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="radio"
                                    name="payment"
                                    id="stripe"
                                    checked={method === 'stripe'}
                                    onChange={() => setMethod('stripe')}
                                />
                                <label htmlFor="stripe">Stripe</label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="radio"
                                    name="payment"
                                    id="razorpay"
                                    checked={method === 'razorpay'}
                                    onChange={() => setMethod('razorpay')}
                                />
                                <label htmlFor="razorpay">Razorpay</label>
                            </div>
                        </div>
                    </div>

                    <CartTotal deliveryFeeOverride={deliveryInfo.deliveryFee} />

                    <button className='bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800'>
                        PLACE ORDER
                    </button>
                </form>
            </div>
        </div>
    )
}

export default PlaceOrder
