import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isRehydrating = !user && isAuthenticated; // Handle rehydration edge case

  console.log("=== PrivateRoute DEBUG ===");
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);
  console.log("required roles:", roles);
  console.log("user.userType:", user?.userType);
  console.log("=========================");

  // Show loading state while rehydrating authentication data
  if (isRehydrating) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check roles and redirect based on user type
  if (roles && !roles.includes(user?.userType)) {
    console.log("User role not authorized. Required:", roles, "Got:", user?.userType);
    // Redirect based on user role
    if (user?.userType === 'Admin') {
      return <Navigate to="/dashboardadmin" replace />;
    } else if (user?.userType === 'Farmer') {
      return <Navigate to="/dashboardfarmer" replace />;
    } else if (user?.userType === 'Customer' || user?.userType === 'Seller') {
      // Customer and Seller users use the marketplace
      return <Navigate to="/marketplace" replace />;
    }

    // If no role-specific dashboard is found, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("PrivateRoute - Access granted, rendering children");
  // Render child components if authenticated and authorized
  return children;
};

export default PrivateRoute;
