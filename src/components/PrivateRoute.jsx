import React from 'react';
import { Navigate } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';

const PrivateRoute = ({ children, role }) => {
  // Get authentication status and user role from your context
  const { user, isAuthenticated } = useShopContext();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 