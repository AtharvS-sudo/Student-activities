import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useNotices = (filters = {}) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/notices?${params.toString()}`);
      setNotices(response.data.notices);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notices');
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.department, filters.club]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const deleteNotice = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prevNotices => prevNotices.filter(n => n._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete notice' 
      };
    }
  };

  const pinNotice = async (id) => {
    try {
      await api.patch(`/notices/${id}/pin`);
      await fetchNotices(); // Refresh to get updated pin status
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to pin/unpin notice' 
      };
    }
  };

  return { 
    notices, 
    loading, 
    error, 
    refetch: fetchNotices, 
    deleteNotice,
    pinNotice
  };
};
