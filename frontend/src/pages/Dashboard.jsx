import React from 'react';
import { useAuth } from '../context/AuthContext';
import NoticeList from '../components/Notice/NoticeList';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome, {user.name}!</h1>
        <p>Role: <strong>{user.role}</strong></p>
        {user.department && (
          <p>Department: <strong>{user.department.name}</strong></p>
        )}
        {user.club && (
          <p>Club: <strong>{user.club.name}</strong></p>
        )}
        <p>
          Posting Privileges:{' '}
          <strong>{user.canPost || user.role === 'admin' ? 'Enabled' : 'Disabled'}</strong>
        </p>
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>Recent Notices</h2>
      <NoticeList />
    </div>
  );
};

export default Dashboard;
