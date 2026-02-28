import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requireSeller = false, role = null }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    console.log('ProtectedRoute - Current user:', user);
    console.log('ProtectedRoute - Token exists:', !!token);
    console.log('ProtectedRoute - Required role:', role);
    console.log('ProtectedRoute - Requires seller:', requireSeller);
  }, []);

  // If no token, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check if seller route but user is not a seller
  if (requireSeller && user.role !== 'seller') {
    console.log('Seller route accessed by non-seller');
    toast.error('Please login as a seller to access this page');
    return <Navigate to="/login?type=seller" />;
  }

  // Check for specific role requirement
  if (role && user.role !== role) {
    console.log('Incorrect role access attempt');
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 