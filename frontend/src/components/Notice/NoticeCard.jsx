import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowRight, FiShare2 } from 'react-icons/fi';
import { MdPushPin } from 'react-icons/md';
import { BsFilePdf } from 'react-icons/bs';
import { useAuth } from '../../hooks';
import { formatDate, formatFileSize } from '../../utils';
import styles from '../../styles/NoticeCard.module.css';

const NoticeCard = ({ notice, onDelete, canDelete, onUpdate, onPin }) => {
  const { user } = useAuth();

  // Share button handler
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = `${window.location.origin}/notice/${notice._id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Pin button handler (admin only)
  const handlePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onPin) {
      const result = await onPin(notice._id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Link to={`/notice/${notice._id}`} className={`${styles.card} ${notice.isPinned ? styles.pinnedCard : ''}`}>
      {notice.isPinned && (
        <div className={styles.pinnedBadge}>
          <MdPushPin size={12} /> PINNED
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={`badge badge-${notice.type}`}>
            {notice.type.toUpperCase()}
          </span>
          <span className={`badge badge-${notice.format}`}>
            {notice.format.toUpperCase()}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleShare}
            title="Copy notice link"
            className={styles.actionButton}
          >
            <FiShare2 size={20} />
          </button>
          {isAdmin && (
            <button
              onClick={handlePin}
              title={notice.isPinned ? 'Unpin notice' : 'Pin notice'}
              className={`${styles.actionButton} ${styles.pinButton} ${notice.isPinned ? styles.pinned : ''}`}
            >
              <MdPushPin size={20} />
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.title}>{notice.title}</h3>

      <p className={styles.issuer}>
        Issued by: {notice.postedBy?.name || 'Unknown'}
      </p>

      {notice.format === 'text' && notice.content && (
        <p className={styles.content}>
          {notice.content}
        </p>
      )}

      {notice.format === 'pdf' && notice.pdfFile && (
        <p className={styles.content}>
          <BsFilePdf style={{ marginRight: '5px', display: 'inline' }} />
          PDF File - {formatFileSize(notice.pdfFile.size)}
        </p>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>
          <FiCalendar size={14} />
          {formatDate(notice.createdAt)}
        </span>
        {notice.format === 'pdf' && (
          <span className={styles.pdfBadge}>PDF</span>
        )}
      </div>
    </Link>
  );
};

export default NoticeCard;
