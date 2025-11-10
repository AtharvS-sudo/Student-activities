import React from 'react';
import NoticeCard from './NoticeCard';
import { useAuth, useNotices } from '../../hooks';

const NoticeList = ({ type, department, club }) => {
  const { user } = useAuth();
  const { notices, loading, deleteNotice, pinNotice, refetch } = useNotices({ 
    type, 
    department, 
    club 
  });

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      const result = await deleteNotice(noticeId);
      if (!result.success) {
        alert(result.message);
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
        onUpdate={refetch}
        onPin={pinNotice}
      />
    ))}
  </div>
);

};

export default NoticeList;
