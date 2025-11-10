import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserPrivileges = async (userId, canPost) => {
    try {
      await api.put(`/users/${userId}/privileges`, { canPost });
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update privileges' 
      };
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/users/${userId}/role`, { role });
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update role' 
      };
    }
  };

  return { 
    users, 
    loading, 
    error, 
    refetch: fetchUsers,
    updateUserPrivileges,
    updateUserRole
  };
};
