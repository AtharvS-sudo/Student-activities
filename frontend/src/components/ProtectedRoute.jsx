import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('Current path:', location.pathname);
  console.log('Loading:', loading);
  console.log('User:', user);
  console.log('IsAuthenticated:', isAuthenticated);
  console.log('Allowed Roles:', allowedRoles);

  if (loading) {
    console.log('Still loading, showing loading screen...');
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated - Redirecting to login');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('❌ User role not authorized - Redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Access granted');
  return <Outlet />;
};

export default ProtectedRoute;
