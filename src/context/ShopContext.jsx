import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext({
    products: [],
    currency: '$',
    search: '',
    showSearch: false,
    cartItems: {},
    getCartCount: () => 0,
    getCartAmount: () => 0,
    getShippingFee: () => 0,
    navigate: () => {},
    backendUrl: '',
    setToken: () => {},
    token: '',
    userProducts: [],
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    user: null,
    login: () => {},
    isAuthenticated: false,
    isSeller: false,
    isAdmin: false,
    loading: false,
    orders: [],
    fetchOrders: () => {},
    unreadMessagesCount: 0,
    fetchUnreadMessagesCount: () => {},
    fetchSellerProducts: () => {},
});

export const useShopContext = () => useContext(ShopContext)

export const ShopContextProvider = ({ children }) => {
    // Auth state
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return null;
            
            const userData = JSON.parse(storedUser);
            console.log('Initializing user from localStorage:', userData);
            
            // Validate user data - check for either id or _id
            if (!userData || (!userData._id && !userData.id)) {
                console.error('Invalid user data in localStorage:', userData);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return null;
            }
            
            // Ensure both id and _id are present
            if (!userData._id) userData._id = userData.id;
            if (!userData.id) userData.id = userData._id;
            
            return userData;
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    
    // Shop state
    const currency = '₦';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [userProducts, setUserProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    // Check authentication status - check for either id or _id
    const isAuthenticated = !!token && !!user && (!!user._id || !!user.id);
    const isSeller = isAuthenticated && user?.role === 'seller';
    const isAdmin = isAuthenticated && user?.role === 'admin';

    // Initialize cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Load user data from localStorage on mount
    useEffect(() => {
        const loadUserData = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                const rememberMe = localStorage.getItem('rememberMe');
                
                // Only auto-login if Remember Me is enabled
                if (storedUser && storedToken && rememberMe === 'true') {
                    const userData = JSON.parse(storedUser);
                    
                    // Validate user data
                    if (!userData || !userData._id) {
                        console.error('Invalid user data in localStorage:', userData);
                        handleLogout();
                        return;
                    }
                    
                    console.log('Auto-login with Remember Me:', userData);
                    setUser(userData);
                    setToken(storedToken);
                } else if (storedUser && storedToken && !rememberMe) {
                    // Clear data if Remember Me is not enabled
                    console.log('Remember Me not enabled, clearing stored data');
                    handleLogout();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                handleLogout();
            }
        };

        loadUserData();
    }, []);

    // Helper function to decode JWT token
    const decodeToken = (token) => {
        try {
            const tokenParts = token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            return payload;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Login function
    const login = async (formData) => {
        setLoading(true);
        try {
            console.log('Attempting login with:', formData);
            let response;
            let token = '';
            // If userData and token are provided (admin or user login from custom page), use them directly
            if (formData.userData && formData.token) {
                token = formData.token;
                setToken(token);
                localStorage.setItem('token', token);
                
                // Handle Remember Me for user login
                if (formData.rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Save as adminToken if admin
                if (formData.userData.role === 'admin') {
                    localStorage.setItem('adminToken', token);
                    console.log('Admin token saved to localStorage:', token);
                }
            } else if (formData.role === 'user') {
                response = await axios.post(`${backendUrl}/api/user/login`, {
                    email: formData.email,
                    password: formData.password
                });
                if (response.data.success) {
                    token = response.data.token;
                    setToken(token);
                    localStorage.setItem('token', token);
                } else {
                    setLoading(false);
                    return { success: false, message: response.data.message };
                }
            } else if (formData.role === 'seller') {
                response = await axios.post(`${backendUrl}/api/auth/login`, formData);
                if (response.data.success) {
                    token = response.data.token;
                    setToken(token);
                    localStorage.setItem('token', token);
                    
                    // Handle Remember Me for seller login
                    if (formData.rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    
                    // Set seller data directly from response
                    const sellerData = response.data.user;
                    console.log('Seller login response:', sellerData);
                    setUser(sellerData);
                    localStorage.setItem('user', JSON.stringify(sellerData));
                    setLoading(false);
                    return { success: true };
                } else {
                    setLoading(false);
                    return { success: false, message: response.data.message };
                }
            } else {
                setLoading(false);
                return { success: false, message: 'Invalid role' };
            }

            // Fetch full user profile after login (only for users, not sellers)
            if (formData.role === 'user') {
                try {
                    const profileRes = await axios.get(`${backendUrl}/api/user/profile`, {
                        headers: { token }
                    });
                    if (profileRes.data && profileRes.data.success) {
                        const userData = profileRes.data.user;
                        console.log('Fetched user profile:', userData);
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                } catch (err) {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setToken('');
        setCartItems({});
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('rememberMe');
        toast.success('Logout successful!');
        if (user && user.role === 'admin') {
            navigate('/admin/login');
        } else {
            navigate('/login');
        }
    };

    // Cart functions
    const addToCart = (itemId, size) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('Product not found');
            return;
        }
        setCartItems(prev => ({
            ...prev,
            [itemId]: {
                quantity: (prev[itemId]?.quantity || 0) + 1,
                size: size || prev[itemId]?.size
            }
        }));
        toast.success('Item added to cart');
    };

    const removeFromCart = (itemId) => {
        if (!isAuthenticated) {
            toast.error('Please login to modify cart');
            navigate('/login');
            return;
        }
        setCartItems(prev => {
            const newCart = { ...prev };
            if (newCart[itemId]?.quantity > 0) {
                newCart[itemId].quantity -= 1;
                if (newCart[itemId].quantity === 0) {
                    delete newCart[itemId];
                }
            }
            return newCart;
        });
    };

    const updateCartItemCount = (newAmount, itemId) => {
        if (!isAuthenticated) {
            toast.error('Please login to modify cart');
            navigate('/login');
            return;
        }
        setCartItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: newAmount
            }
        }));
    };

    const getCartCount = () => {
        return Object.values(cartItems).reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    };

    const getShippingFee = () => 0;

    const getCartAmount = () => {
        let total = 0;
        for (const itemId in cartItems) {
            const product = products.find(p => p._id === itemId);
            if (product) {
                total += parseFloat((product.price * (cartItems[itemId].quantity || 0)).toFixed(2));
            }
        }
        return parseFloat(total.toFixed(2));
    };

    const getCartProducts = () => {
        return Object.keys(cartItems).map(itemId => {
            const product = products.find(p => p._id === itemId);
            if (!product) return null;
            return {
                ...product,
                quantity: cartItems[itemId].quantity || 0,
                size: cartItems[itemId].size,
                image: product.images || product.image || [], // Try both images and image fields
                images: product.images || [product.image] || [] // Ensure both fields are available
            };
        }).filter(item => item && item._id); // Filter out null items and ensure _id exists
    };

    const clearCart = () => {
        setCartItems({});
        localStorage.removeItem('cartItems');
    };

    // Product functions
    const addProduct = async (formData) => {
        try {
            const response = await axios.post(`${backendUrl}/api/product/seller/add`, formData, {
                headers: {
                    token: token,
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.data.success) {
                // Update both userProducts and main products list
                const newProduct = response.data.product;
                setUserProducts(prevProducts => [newProduct, ...prevProducts]);
                setProducts(prevProducts => [newProduct, ...prevProducts]);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const updateProduct = (productId, updatedProduct) => {
        setUserProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
    };

    const deleteProduct = (productId) => {
        setUserProducts(prev => prev.filter(p => p._id !== productId));
    };

    // API functions
    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                // Process products to ensure image arrays are properly formatted
                // and filter only approved products
                const processedProducts = response.data.products
                    .filter(product => product.approvalStatus === 'approved')
                    .map(product => {
                        // Normalize image data
                        const images = product.images || [];
                        const image = product.image ? (Array.isArray(product.image) ? product.image : [product.image]) : [];
                        const allImages = [...new Set([...images, ...image])];
                        
                        return {
                            ...product,
                            image: allImages,
                            images: allImages
                        };
                    });
                setProducts(processedProducts.reverse());
                console.log('Loaded products:', processedProducts); // Debug log
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log('Error loading products:', error)
            toast.error(error.message)
        }
    };

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Load products from localStorage on mount
    useEffect(() => {
        const storedProducts = localStorage.getItem('userProducts');
        if (storedProducts) {
            try {
                setUserProducts(JSON.parse(storedProducts));
            } catch (error) {
                console.error('Error parsing stored products:', error);
                localStorage.removeItem('userProducts');
            }
        }
    }, []);

    // Load products on mount
    useEffect(() => {
        getProductsData();
    }, []);

    const fetchOrders = async () => {
        if (!token || !user) return;
        try {
            let url = '';
            if (user.role === 'seller') {
                url = backendUrl + '/api/order/seller-orders';
            } else {
                url = backendUrl + '/api/order/my-orders';
            }
            const res = await axios.get(url, { headers: { token } });
            if (res.data.success) {
                setOrders(res.data.orders || []);
            } else {
                setOrders([]);
            }
        } catch (err) {
            setOrders([]);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchOrders();
        // eslint-disable-next-line
    }, [isAuthenticated, user]);

    const fetchUnreadMessagesCount = async (token) => {
        if (!token) {
            setUnreadMessagesCount(0);
            return;
        }
        try {
            const res = await axios.get('/api/messages/conversations', {
                headers: { token }
            });
            const conversations = res.data.conversations || [];
            const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            setUnreadMessagesCount(totalUnread);
        } catch (err) {
            setUnreadMessagesCount(0);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUnreadMessagesCount(token);
            const interval = setInterval(() => fetchUnreadMessagesCount(token), 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    // Fetch seller's products
    const fetchSellerProducts = async () => {
        if (!isAuthenticated || !isSeller || !token) return;
        try {
            const response = await axios.get(`${backendUrl}/api/product/seller/products`, {
                headers: { token }
            });
            if (response.data.success) {
                setUserProducts(response.data.products);
            } else {
                setUserProducts([]);
            }
        } catch (error) {
            setUserProducts([]);
            toast.error('Failed to fetch your products');
        }
    };

    // Fetch seller products when authenticated and isSeller
    useEffect(() => {
        if (isAuthenticated && isSeller) {
            fetchSellerProducts();
        }
    }, [isAuthenticated, isSeller]);

    const contextValue = {
        // Auth
        user,
        login,
        logout: handleLogout,
        loading,
        isAuthenticated,
        isSeller,
        isAdmin,
        token,
        setToken,

        // Shop
        products,
        currency,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCartItemCount,
        getCartCount,
        getCartAmount,
        getShippingFee,
        getCartProducts,
        clearCart,
        navigate,
        backendUrl,
        userProducts,
        setUserProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        fetchOrders,
        unreadMessagesCount,
        fetchUnreadMessagesCount,
        setUser,
        handleLogout,
        fetchSellerProducts,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
