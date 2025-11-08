import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UserManagement from '../components/Admin/UserManagement';

const AdminPanel = () => {
  const { user } = useAuth();

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Admin Panel</h1>
      <UserManagement />
    </div>
  );
};

export default AdminPanel;
