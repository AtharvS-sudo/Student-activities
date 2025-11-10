import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiFileText, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { BsFilePdf } from 'react-icons/bs';
import { useAuth, useNoticeDetail } from '../hooks';
import styles from '../styles/NoticeDetail.module.css';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notice, loading, error, deleteNotice } = useNoticeDetail(id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      const result = await deleteNotice();
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
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

  const canEdit = () => {
    return (
      user.canPost &&
      notice.postedBy?._id === user.id
    );
  };

  const handleEdit = () => {
    navigate(`/notice/${id}/edit`);
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
    <div className={styles.container}>
      <button
        onClick={() => navigate(-1)}
        className={`btn btn-primary ${styles.backButton}`}
      >
        <FiArrowLeft /> Go Back
      </button>

      <div className={styles.card}>
        <div className={styles.badges}>
          <span className={`badge badge-${notice.type}`}>
            {notice.type.toUpperCase()}
          </span>
          <span className={`badge badge-${notice.format}`}>
            {notice.format.toUpperCase()}
          </span>
        </div>

        <h1 className={styles.title}>{notice.title}</h1>

        <div className={styles.infoBox}>
          <p className={styles.infoItem}>
            <FiUser />
            <span className={styles.infoLabel}>Posted by:</span> {notice.postedBy?.name || 'Unknown'}
          </p>
          <p className={styles.infoItem}>
            <FiCalendar />
            <span className={styles.infoLabel}>Date:</span> {formatDate(notice.createdAt)}
          </p>
          {notice.department && (
            <p className={styles.infoItem}>
              <FiFileText />
              <span className={styles.infoLabel}>Department:</span> {notice.department.name}
            </p>
          )}
          {notice.club && (
            <p className={styles.infoItem}>
              <FiFileText />
              <span className={styles.infoLabel}>Club:</span> {notice.club.name}
            </p>
          )}
        </div>

        {notice.content && (
          <div className={styles.contentBox}>
            {notice.content}
          </div>
        )}

        {notice.pdfFile && (
          <div>
            <button
              className={`btn btn-primary ${styles.pdfButton}`}
              onClick={handleViewPDF}
            >
              <BsFilePdf /> View PDF File ({(notice.pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          {canEdit() && (
            <button
              className={`btn btn-primary ${styles.editButton}`}
              onClick={handleEdit}
              style={{
                background: '#2a5298',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FiEdit /> Edit Notice
            </button>
          )}
          {canDelete() && (
            <button
              className={`btn btn-danger ${styles.deleteButton}`}
              onClick={handleDelete}
            >
              Delete Notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
