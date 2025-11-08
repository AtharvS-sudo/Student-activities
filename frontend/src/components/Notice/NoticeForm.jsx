import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const NoticeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'academic',
    department: '',
    club: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchClubs();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(response.data.clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
      
      setFormData({
        title: '',
        content: '',
        type: 'academic',
        department: '',
        club: '',
      });
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
    <div style={{
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto',
      background: 'white',
      borderRadius: '10px',
      padding: '50px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e8ecf1'
    }}>
      <h2 style={{ 
        fontSize: '28px', 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontWeight: '700' 
      }}>
        Create New Notice
      </h2>
      
      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #f44336',
          background: '#ffebee',
          color: '#c62828',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #4caf50',
          background: '#f1f8e9',
          color: '#2e7d32',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            fontSize: '15px' 
          }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notice title"
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1.5px solid #d5dce0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: '#ffffff',
              color: '#2c3e50'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            fontSize: '15px' 
          }}>
            Type *
          </label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1.5px solid #d5dce0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: '#ffffff',
              color: '#2c3e50'
            }}
          >
            <option value="academic">Academic</option>
            <option value="club">Club</option>
          </select>
        </div>

        {formData.type === 'academic' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600', 
              color: '#2c3e50', 
              fontSize: '15px' 
            }}>
              Department (Optional)
            </label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid #d5dce0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#ffffff',
                color: '#2c3e50'
              }}
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600', 
              color: '#2c3e50', 
              fontSize: '15px' 
            }}>
              Club (Optional)
            </label>
            <select 
              name="club" 
              value={formData.club} 
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid #d5dce0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#ffffff',
                color: '#2c3e50'
              }}
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            fontSize: '15px' 
          }}>
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter notice content..."
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1.5px solid #d5dce0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: '#ffffff',
              color: '#2c3e50',
              minHeight: '200px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#2c3e50', 
            fontSize: '15px' 
          }}>
            Attach PDF (Optional, Max 5MB)
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1.5px solid #d5dce0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              background: '#ffffff',
              color: '#2c3e50'
            }}
          />
          {pdfFile && (
            <p style={{ 
              marginTop: '10px', 
              fontSize: '14px', 
              color: '#28a745', 
              fontWeight: '500' 
            }}>
              ✓ Selected: {pdfFile.name} ({fileSize.toFixed(2)} MB)
            </p>
          )}
          <p style={{
            marginTop: '8px',
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            Optional: Attach a PDF document to accompany your notice
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 32px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            minWidth: '200px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creating...' : 'Create Notice'}
        </button>
      </form>
    </div>
  );
};

export default NoticeForm;
