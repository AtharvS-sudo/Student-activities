import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { BsFilePdf } from 'react-icons/bs';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await api.get(`/notices/${id}`);
      setNotice(response.data.notice);
    } catch (error) {
      setError('Failed to load notice');
      console.error('Error fetching notice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        navigate('/dashboard');
      } catch (error) {
        setError('Failed to delete notice');
      }
    }
  };

  const handleViewPDF = () => {
    if (notice.pdfFile?.path) {
      window.open(
        `http://localhost:5000/${notice.pdfFile.path}`,
        '_blank'
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canDelete = () => {
    return (
      user.role === 'admin' ||
      notice.postedBy?._id === user.id
    );
  };

  if (loading) {
    return <div className="loading">Loading notice...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container">
        <div className="alert alert-error">Notice not found</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-primary"
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        <FiArrowLeft /> Go Back
      </button>

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <span className={`badge badge-${notice.type}`}>
            {notice.type.toUpperCase()}
          </span>
          <span className={`badge badge-${notice.format}`}>
            {notice.format.toUpperCase()}
          </span>
        </div>

        <h1 style={{ marginBottom: '20px', color: '#333' }}>{notice.title}</h1>

        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '4px',
          marginBottom: '20px',
          borderLeft: '4px solid #007bff'
        }}>
          <p style={{ margin: '8px 0', color: '#666' }}>
            <FiUser style={{ marginRight: '8px' }} />
            <strong>Posted by:</strong> {notice.postedBy?.name || 'Unknown'}
          </p>
          <p style={{ margin: '8px 0', color: '#666' }}>
            <FiCalendar style={{ marginRight: '8px' }} />
            <strong>Date:</strong> {formatDate(notice.createdAt)}
          </p>
          {notice.department && (
            <p style={{ margin: '8px 0', color: '#666' }}>
              <FiFileText style={{ marginRight: '8px' }} />
              <strong>Department:</strong> {notice.department.name}
            </p>
          )}
          {notice.club && (
            <p style={{ margin: '8px 0', color: '#666' }}>
              <FiFileText style={{ marginRight: '8px' }} />
              <strong>Club:</strong> {notice.club.name}
            </p>
          )}
        </div>

        {notice.format === 'text' && notice.content && (
          <div style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            marginBottom: '20px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#333'
          }}>
            {notice.content}
          </div>
        )}

        {notice.format === 'pdf' && notice.pdfFile && (
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={handleViewPDF}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <BsFilePdf /> View PDF File ({(notice.pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </button>
          </div>
        )}

        {canDelete() && (
          <button
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete Notice
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeDetail;
