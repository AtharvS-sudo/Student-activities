import { useState, useEffect } from 'react';
import api from '../services/api';

export const useNoticeDetail = (noticeId) => {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!noticeId) return;

    const fetchNotice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/notices/${noticeId}`);
        setNotice(response.data.notice);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notice');
        console.error('Error fetching notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  const deleteNotice = async () => {
    try {
      await api.delete(`/notices/${noticeId}`);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete notice' 
      };
    }
  };

  return { notice, loading, error, deleteNotice };
};
