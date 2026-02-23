import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isRehydrating = !user && isAuthenticated; // Handle rehydration edge case

  // Show loading state while rehydrating authentication data
  if (isRehydrating) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check roles and redirect based on user type
  if (roles && !roles.includes(user?.userType)) {
    // Redirect based on user role
    if (user?.userType === 'Admin') {
      return <Navigate to="/dashboardadmin" replace />;
    } else if (user?.userType === 'Farmer') {
      return <Navigate to="/dashboarfarmer" replace />;
    } else if (user?.userType === 'Customer') {
      return <Navigate to="/dashboardcustomer" replace />;
    } else if (user?.userType === 'Seller') {
      return <Navigate to="/dashboardseller" replace />;
    }

    // If no role-specific dashboard is found, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Render child components if authenticated and authorized
  return children;
};

export default PrivateRoute;