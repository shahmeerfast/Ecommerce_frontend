import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from '../config/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useShopContext();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: location.search.includes('type=seller') ? 'seller' : 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = () => {
        if (formData.role === 'seller') {
            navigate('/seller/register');
        } else {
            navigate('/register');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (formData.role === 'user') {
                response = await axios.post('/api/user/login', {
                    email: formData.email,
                    password: formData.password
                });
                if (response.data.success) {
                    console.log('Login response:', response.data);
                    
                    // Decode JWT token to get user ID
                    const token = response.data.token;
                    const tokenParts = token.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('Decoded token payload:', payload);
                    
                    const userId = payload.id || payload._id || payload.userId;

                    if (!userId) {
                        console.error('No user ID found in token payload:', payload);
                        toast.error('Login failed - Invalid user data');
                        return;
                    }

                    const userData = {
                        _id: userId,
                        id: userId,
                        email: formData.email,
                        role: 'user'
                    };
                    console.log('Sending user data to context:', userData);
                    await login({
                        ...formData,
                        token: response.data.token,
                        userData: userData,
                        rememberMe: rememberMe
                    });
                    toast.success('Login successful!');
                    navigate('/');
                } else {
                    toast.error(response.data.message || 'Login failed');
                }
            } else if (formData.role === 'seller') {
                const result = await login({
                    ...formData,
                    rememberMe: rememberMe
                });
                if (result.success) {
                    toast.success('Login successful!');
                    navigate('/seller/dashboard');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {formData.role === 'seller' ? 'Seller Login' : 'User Login'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <button
                            onClick={handleRegister}
                            className="font-medium text-black hover:text-gray-800"
                        >
                            {formData.role === 'seller'
                                ? 'register as a seller'
                                : 'register as a user'}
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm pr-10"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <span
                                    className="absolute right-3 cursor-pointer"
                                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={0}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                            >
                                <option value="user">User</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>

                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="font-medium text-black hover:text-gray-800"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
