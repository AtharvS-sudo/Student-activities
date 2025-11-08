import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowRight, FiShare2 } from 'react-icons/fi';
import { MdPushPin } from 'react-icons/md';
import { BsFilePdf } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NoticeCard = ({ notice, onDelete, canDelete, onUpdate }) => {
  const { user } = useAuth();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Share button handler
  const handleShare = () => {
    const link = `${window.location.origin}/notice/${notice._id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Pin button handler (admin only)
  const handlePin = async () => {
    try {
      await api.patch(`/notices/${notice._id}/pin`);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to pin/unpin notice');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="card" style={{ position: 'relative' }}>
      {notice.isPinned && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#ff9800',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <MdPushPin size={12} /> PINNED
        </div>
      )}

      <div className="notice-card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems:'center'}}>
        <div>
          <span className={`badge badge-${notice.type}`}>
            {notice.type.toUpperCase()}
          </span>
          <span className={`badge badge-${notice.format}`}>
            {notice.format.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleShare}
            title="Copy notice link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#2a5298'
            }}
          >
            <FiShare2 size={20} />
          </button>
          {isAdmin && (
            <button
              onClick={handlePin}
              title={notice.isPinned ? 'Unpin notice' : 'Pin notice'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: notice.isPinned ? '#ff9800' : '#999'
              }}
            >
              <MdPushPin size={20} />
            </button>
          )}
        </div>
      </div>

      <h3 className="notice-card-title">{notice.title}</h3>

      {notice.format === 'text' && notice.content && (
        <p className="notice-card-preview">
          {notice.content}
        </p>
      )}

      {notice.format === 'pdf' && notice.pdfFile && (
        <p className="notice-card-preview">
          <BsFilePdf style={{ marginRight: '5px', display: 'inline' }} />
          PDF File - {(notice.pdfFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div className="notice-card-meta">
          <FiUser size={16} />
          <span>{notice.postedBy?.name || 'Unknown'}</span>
        </div>
        <div className="notice-card-meta">
          <FiCalendar size={16} />
          <span>{formatDate(notice.createdAt)}</span>
        </div>
      </div>

      <div className="notice-card-actions">
        <Link
          to={`/notice/${notice._id}`}
          className="btn btn-primary"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
        >
          Read More <FiArrowRight size={16} />
        </Link>
        {canDelete && (
          <button
            className="btn btn-danger"
            onClick={() => onDelete(notice._id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeCard;
