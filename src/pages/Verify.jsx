import React, { useState } from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import {toast} from 'react-toastify'
import axios from 'axios'

const Verify = () => {
    const { navigate, token, setCartItems, backendUrl, user, setUser } = useContext(ShopContext)
    const [searchParams, setSearchParams] = useSearchParams()
    const [breakdown, setBreakdown] = useState(null);
    const [verifying, setVerifying] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {
            if (!token || !user?._id) {
                console.log('No token or user ID found');
                setVerifying(false);
                return null;
            }

            console.log('Verifying payment with:', { success, orderId, userId: user._id });
            const response = await axios.post(backendUrl + '/api/order/verifyStripe', 
                { 
                    success, 
                    orderId,
                    userId: user._id 
                }, 
                { 
                    headers: { token } 
                }
            );

            if (response.data.success) {
                // Try to get breakdown from session storage (set before redirect), or skip
                const storedBreakdown = sessionStorage.getItem('stripeBreakdown');
                if (storedBreakdown) {
                    setBreakdown(JSON.parse(storedBreakdown));
                    sessionStorage.removeItem('stripeBreakdown');
                }
                setCartItems({})
                // Fetch latest user profile after payment
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
                setTimeout(() => navigate('/orders'), 4000)
            } else {
                setErrorMsg(response.data.message || 'Payment verification failed');
                setTimeout(() => navigate('/cart'), 3000)
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || error.message || 'Payment verification failed');
            setTimeout(() => navigate('/cart'), 3000)
        } finally {
            setVerifying(false);
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token, user])

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">{verifying ? 'Verifying Payment...' : errorMsg ? 'Payment Failed' : 'Payment Successful!'}</h2>
                {verifying && <p className="text-gray-600">Please wait while we confirm your payment.</p>}
                {errorMsg && <p className="text-red-500">{errorMsg}</p>}
                {breakdown && !verifying && !errorMsg && (
                    <div className="mt-6 bg-white rounded shadow p-4 inline-block text-left">
                        <h3 className="font-semibold mb-2">Order Summary (₦)</h3>
                        <ul className="mb-2">
                            {breakdown.products.map((item, idx) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>₦{item.total_naira.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between border-t pt-2">
                            <span>Delivery Fee</span>
                            <span>₦{breakdown.deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>₦{breakdown.total.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">You will be redirected to your orders shortly...</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Verify