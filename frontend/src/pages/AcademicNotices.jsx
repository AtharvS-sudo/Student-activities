import React from 'react';
import NoticeList from '../components/Notice/NoticeList';

const AcademicNotices = () => {
  return (
    <div className="container">
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700' 
      }}>
        Academic Notices
      </h1>
      <NoticeList type="academic" />
    </div>
  );
};

export default AcademicNotices;
