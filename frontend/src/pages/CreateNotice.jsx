import React from 'react';
import NoticeForm from '../components/Notice/NoticeForm';

const CreateNotice = () => {
  return (
    <div className="container">
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700',
        textAlign: 'center'
      }}>
        
      </h1>
      
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        <NoticeForm />
      </div>
    </div>
  );
};

export default CreateNotice;
