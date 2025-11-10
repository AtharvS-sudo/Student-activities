import { useState, useEffect } from 'react';
import api from '../services/api';

export const useClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/clubs');
        setClubs(response.data.clubs);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch clubs');
        console.error('Error fetching clubs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return { clubs, loading, error };
};
