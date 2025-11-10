import React, { useState } from 'react';
import api from '../../services/api';
import { useDepartments, useClubs, useForm } from '../../hooks';
import styles from '../../styles/NoticeForm.module.css';

const NoticeForm = ({ onSuccess }) => {
  const { values: formData, handleChange, resetForm } = useForm({
    title: '',
    content: '',
    type: 'academic',
    department: '',
    club: '',
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { departments } = useDepartments();
  const { clubs } = useClubs();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setPdfFile(file);
      setFileSize(file.size / 1024 / 1024);
      setError('');
    } else {
      setPdfFile(null);
      setFileSize(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title.trim()) {
        setError('Please enter a notice title');
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError('Please enter notice content');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('type', formData.type);
      submitData.append('content', formData.content.trim());
      
      // Format is determined by whether PDF is attached
      if (pdfFile) {
        submitData.append('format', 'pdf');
        submitData.append('pdfFile', pdfFile);
      } else {
        submitData.append('format', 'text');
      }

      if (formData.type === 'academic' && formData.department) {
        submitData.append('department', formData.department);
      } else if (formData.type === 'club' && formData.club) {
        submitData.append('club', formData.club);
      }

      const response = await api.post('/notices', submitData);

      setSuccess('Notice created successfully!');
      
      resetForm();
      setPdfFile(null);
      setFileSize(0);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create notice';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create New Notice</h2>
      
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notice title"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Type *</label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="academic">Academic</option>
            <option value="club">Club</option>
          </select>
        </div>

        {formData.type === 'academic' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Department (Optional)</label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.type === 'club' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Club (Optional)</label>
            <select 
              name="club" 
              value={formData.club} 
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select Club</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter notice content..."
            required
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Attach PDF (Optional, Max 5MB)</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          {pdfFile && (
            <p className={styles.fileInfo}>
              ✓ Selected: {pdfFile.name} ({fileSize.toFixed(2)} MB)
            </p>
          )}
          <p className={styles.fileHint}>
            Optional: Attach a PDF document to accompany your notice
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating...' : 'Create Notice'}
        </button>
      </form>
    </div>
  );
};

export default NoticeForm;
