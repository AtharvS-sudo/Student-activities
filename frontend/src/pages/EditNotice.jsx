import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useDepartments, useClubs } from '../hooks';

const EditNotice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { departments } = useDepartments();
  const { clubs } = useClubs();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'academic',
    department: '',
    club: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await api.get(`/notices/${id}`);
      const notice = response.data.notice;
      setFormData({
        title: notice.title,
        content: notice.content,
        type: notice.type,
        department: notice.department?._id || '',
        club: notice.club?._id || '',
      });
    } catch (err) {
      setError('Failed to load notice');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.put(`/notices/${id}`, formData);
      alert('Notice updated successfully!');
      navigate(`/notice/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading notice...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700',
        textAlign: 'center'
      }}>
        Edit Notice
      </h1>
      
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {error && (
          <div style={{
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px' 
            }}>
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px' 
            }}>
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="8"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px' 
            }}>
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <option value="academic">Academic</option>
              <option value="club">Club</option>
            </select>
          </div>

          {formData.type === 'academic' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px' 
              }}>
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}

          {formData.type === 'club' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px' 
              }}>
                Club
              </label>
              <select
                name="club"
                value={formData.club}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="">Select Club</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>{club.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                background: '#2a5298',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Updating...' : 'Update Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotice;
