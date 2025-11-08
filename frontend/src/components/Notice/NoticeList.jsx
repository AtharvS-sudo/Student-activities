import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import NoticeCard from './NoticeCard';
import { useAuth } from '../../context/AuthContext';

const NoticeList = ({ type, department, club }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotices();
  }, [type, department, club]);

  const fetchNotices = async () => {
    try {
      let url = '/notices?';
      if (type) url += `type=${type}&`;
      if (department) url += `department=${department}&`;
      if (club) url += `club=${club}&`;

      const response = await api.get(url);
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${noticeId}`);
        fetchNotices();
      } catch (error) {
        alert('Failed to delete notice');
      }
    }
  };

  const canDeleteNotice = (notice) => {
    return (
      user.role === 'admin' ||
      notice.postedBy?._id === user.id
    );
  };

  if (loading) {
    return <div className="loading">Loading notices...</div>;
  }

  if (notices.length === 0) {
    return (
      <div className="card">
        <p>No notices available.</p>
      </div>
    );
  }

return (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
      width: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}
  >
    {notices.map((notice) => (
      <NoticeCard
        key={notice._id}
        notice={notice}
        onDelete={handleDelete}
        canDelete={canDeleteNotice(notice)}
        onUpdate={fetchNotices}
      />
    ))}
  </div>
);

};

export default NoticeList;
