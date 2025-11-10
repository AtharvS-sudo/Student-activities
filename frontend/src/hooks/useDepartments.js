import { useState, useEffect } from 'react';
import api from '../services/api';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/departments');
        setDepartments(response.data.departments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch departments');
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
};
