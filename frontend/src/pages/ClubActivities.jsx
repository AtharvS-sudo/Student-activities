import React from 'react';
import NoticeList from '../components/Notice/NoticeList';

const ClubActivities = () => {
  return (
    <div className="container">
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700' 
      }}>
        Club Activities
      </h1>
      <NoticeList type="club" />
    </div>
  );
};

export default ClubActivities;
