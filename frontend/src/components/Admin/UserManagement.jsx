import React, { useState, useEffect } from 'react';
import { useUsers, useClubs } from '../../hooks';
import api from '../../services/api';
import styles from '../../styles/AdminPanel.module.css';

const UserManagement = () => {
  const { users, loading, updateUserPrivileges, updateUserRole, refetch } = useUsers();
  const { clubs } = useClubs();
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');

  const togglePostingPrivilege = async (userId, currentStatus) => {
    const result = await updateUserPrivileges(userId, !currentStatus);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole);
    if (!result.success) {
      alert(result.message);
    }
  };

  const openAdditionalRolesModal = (user) => {
    setEditingUser(user);
    setSelectedRoles(user.additionalRoles || []);
    setSelectedClub(user.club?._id || '');
  };

  const toggleAdditionalRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const saveAdditionalRoles = async () => {
    try {
      // Validate: if club_head is selected, a club must be chosen
      if (selectedRoles.includes('club_head') && !selectedClub) {
        alert('Please select a club for the club head role');
        return;
      }

      await api.put(`/users/${editingUser._id}/additional-roles`, { 
        additionalRoles: selectedRoles 
      });

      // Update club assignment if club_head is selected
      if (selectedRoles.includes('club_head') && selectedClub) {
        await api.put(`/users/${editingUser._id}`, { 
          club: selectedClub 
        });
      }

      setEditingUser(null);
      setSelectedClub('');
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update additional roles');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      alert('User deleted successfully');
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>User Management</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Primary Role</th>
              <th>Additional Roles</th>
              <th>Can Post</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className={styles.select}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {user.additionalRoles && user.additionalRoles.length > 0 ? (
                      user.additionalRoles.map(role => (
                        <span key={role} className="badge badge-club" style={{ fontSize: '11px' }}>
                          {role === 'club_member' ? 'Club Member' : 'Club Head'}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>None</span>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={user.canPost}
                    onChange={() => togglePostingPrivilege(user._id, user.canPost)}
                    className={styles.checkbox}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openAdditionalRolesModal(user)}
                      style={{
                        padding: '6px 12px',
                        background: '#2a5298',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Manage Roles
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      style={{
                        padding: '6px 12px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Roles Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#1e3c72',
              marginBottom: '10px' 
            }}>
              Manage Additional Roles
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              {editingUser.name} - Primary Role: <strong>{editingUser.role}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes('club_head')}
                  onChange={() => toggleAdditionalRole('club_head')}
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Club Head</span>
              </label>

              {/* Club Selection - Only show if club_head is selected */}
              {selectedRoles.includes('club_head') && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px' 
                  }}>
                    Select Club <span style={{ color: '#f44336' }}>*</span>
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Select a club</option>
                    {clubs.map(club => (
                      <option key={club._id} value={club._id}>
                        {club.name} ({club.category})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    This user will be assigned as the head of the selected club
                  </p>
                </div>
              )}

              <p style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginTop: '16px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '6px',
                lineHeight: '1.5'
              }}>
                <strong>Note:</strong> Club Member role is automatically assigned when a student's club application is approved by a club head.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveAdditionalRoles}
                style={{
                  padding: '10px 20px',
                  background: '#2a5298',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
