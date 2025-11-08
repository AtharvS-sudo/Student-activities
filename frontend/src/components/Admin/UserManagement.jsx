import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePostingPrivilege = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/privileges`, {
        canPost: !currentStatus,
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to update privileges');
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="card">
      <h2>User Management</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Can Post</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user._id, e.target.value)}
                    style={{ padding: '5px' }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="club_member">Club Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={user.canPost}
                    onChange={() => togglePostingPrivilege(user._id, user.canPost)}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${user.canPost ? 'badge-academic' : 'badge-text'}`}>
                    {user.canPost ? 'Can Post' : 'Cannot Post'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
