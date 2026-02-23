import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // If user is logged in, redirect to their respective dashboard
  if (isAuthenticated) {
    const dashboardPath = getDashboardPath(user.userType);
    return <Navigate to={dashboardPath} />;
  }

  // Otherwise, render the child component
  return children;
};

// Helper function to determine dashboard path based on user type
const getDashboardPath = (userType) => {
  switch (userType) {
    case 'Admin':
      return '/dashboardadmin';
    case 'Farmer':
      return '/dashboardfarmer';
    case 'Customer':
      return '/dashboardcustomer';
    case 'Seller':
        return '/dashboardseller';
    default:
      return '/dashboard'; // Default dashboard if no userType matches
  }
};

export default PublicRoute;