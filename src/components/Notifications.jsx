import { useState, useEffect, useRef } from 'react';
import { useShopContext } from '../context/ShopContext';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, token } = useShopContext();
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user?._id || !token) return;
        
        try {
            console.log('Fetching notifications for user:', user); // Debug log
            const response = await axios.post('/api/notifications/get', {
                userId: user._id,
                userType: user.role === 'seller' ? 'seller' : (user.role === 'admin' ? 'admin' : 'user')
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Notifications response:', response.data); // Debug log
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
            console.log('Updated notifications:', response.data);
            console.log('Updated unread count:', response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        if (user?._id && token) {
            console.log('User data in Notifications component:', user); // Debug log
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user?._id, token]); // More specific dependencies

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/read/${notificationId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all', {
                userId: user?._id,
                userType: user.role === 'seller' ? 'seller' : (user.role === 'admin' ? 'admin' : 'user')
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_placed':
                return '🛍️';
            case 'order_status_update':
                return '📦';
            case 'product_approval':
                return '✅';
            case 'new_registration':
                return '👤';
            case 'product_submission':
                return '📦';
            case 'payment_release':
                return '💰';
            default:
                return '📢';
        }
    };

    console.log('NOTIFICATIONS ARRAY:', notifications);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white focus:outline-none"
            >
                <i className="bx bxs-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2233] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700" style={{background: document.body.classList.contains('navy-dark') ? '#1a2233' : undefined}}>
                    <div className="p-2 border-b flex justify-between items-center border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                            <button
                                onClick={markAllAsRead}
                            className="text-sm px-3 py-1 rounded font-semibold transition-colors duration-150 mt-0 ml-2 bg-transparent text-blue-600 hover:text-blue-800 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                            style={{marginTop: 0}}
                            >
                                Mark all as read
                            </button>
                    </div>
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-3 hover:bg-gray-50 dark:hover:bg-[#232e3c] cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/40' : 'bg-white dark:bg-transparent'}`}
                                    style={{background: document.body.classList.contains('navy-dark') ? '#1a2233' : undefined}}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="flex items-start">
                                        <span className="text-2xl mr-3">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1">
                                            <span className={`notification-message block ${!notification.isRead ? 'font-semibold' : ''}`} style={{color: document.body.classList.contains('navy-dark') ? '#dbeafe' : '#232e3c', display: 'block'}}>
                                                {notification.message && notification.message.trim() ? notification.message : <span>NO MESSAGE FOUND</span>}
                                            </span>
                                            <p className="notification-time text-xs text-gray-500 dark:text-gray-300 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                            No notifications yet
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;