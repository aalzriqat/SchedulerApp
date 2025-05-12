import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import usePersistedState from '../hooks/usePersistedState'; // Import the custom hook

const PrivateRoute = ({ children, role }) => {
  const isAuthenticated = useSelector((state) => state?.users?.isAuthenticated);
  const userRole = useSelector((state) => state?.users?.user?.role); 

  // Use the custom hook to persist the token
  usePersistedState("token", null);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;