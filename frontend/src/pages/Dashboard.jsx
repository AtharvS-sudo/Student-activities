import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiUser, FiSearch } from 'react-icons/fi';
import { MdPushPin } from 'react-icons/md';
import { BsFilePdf } from 'react-icons/bs';

const Dashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchNotices();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, searchTerm, selectedDepartment, selectedDate]);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filterNotices = () => {
    let filtered = [...notices];

    if (searchTerm) {
      filtered = filtered.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(notice =>
        notice.department?._id === selectedDepartment
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(notice => {
        const noticeDate = new Date(notice.createdAt).toISOString().split('T')[0];
        return noticeDate === selectedDate;
      });
    }

    const pinned = filtered.filter(notice => notice.isPinned);
    const recent = filtered.filter(notice => !notice.isPinned);

    setPinnedNotices(pinned);
    setRecentNotices(recent);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Header Section */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8ecf1', padding: '40px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#1e3c72',
            margin: '0 0 8px 0'
          }}>
            Notice Board
          </h1>
          <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            Welcome back! Here are the latest updates.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ background: 'white', padding: '30px 40px', borderBottom: '1px solid #e8ecf1' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
              <FiSearch 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  background: '#fff',
                }}
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '15px',
                background: '#fff',
                minWidth: '200px',
                cursor: 'pointer',
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '15px',
                background: '#fff',
                minWidth: '180px',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Pinned Notices Section */}
        {pinnedNotices.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e3c72',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Pinned Notices
            </h2>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {pinnedNotices.map(notice => (
                <Link
                  key={notice._id}
                  to={`/notice/${notice._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid #e8ecf1',
                    borderLeft: '4px solid #ff9800',
                    borderRadius: '10px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <MdPushPin size={20} color="#ff9800" />
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#1e3c72',
                        margin: 0,
                        flex: 1
                      }}>
                        {notice.title}
                      </h3>
                    </div>
                    
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#666', 
                      marginBottom: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      Issued by: {notice.postedBy?.name || 'Unknown'}
                    </p>

                    <p style={{ 
                      fontSize: '14px', 
                      color: '#444', 
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flex: 1,
                      margin: '0 0 16px 0'
                    }}>
                      {notice.content}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid #f0f0f0',
                      marginTop: 'auto'
                    }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiCalendar size={14} />
                        {formatDate(notice.createdAt)}
                      </span>
                      {notice.format === 'pdf' && (
                        <span style={{
                          padding: '4px 12px',
                          background: '#ffe0e0',
                          color: '#c62828',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          PDF
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notices Section */}
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e3c72',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Recent Notices
          </h2>

          {recentNotices.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e8ecf1',
              borderRadius: '10px',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#999', fontSize: '16px' }}>
                No notices found matching your filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentNotices.map(notice => (
                <Link
                  key={notice._id}
                  to={`/notice/${notice._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid #e8ecf1',
                    borderRadius: '10px',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fbff';
                    e.currentTarget.style.borderColor = '#2a5298';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e8ecf1';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: notice.format === 'pdf' ? '#ffe0e0' : '#e3f2fd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BsFilePdf size={20} color={notice.format === 'pdf' ? '#c62828' : '#1565c0'} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: '#1e3c72',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notice.title}
                        </h3>
                        <p style={{ 
                          fontSize: '13px', 
                          color: '#999',
                          margin: 0
                        }}>
                          Dept: {notice.department?.name || notice.club?.name || 'General'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '20px' }}>
                      <span style={{ fontSize: '13px', color: '#999', minWidth: '100px', textAlign: 'right' }}>
                        {formatDate(notice.createdAt)}
                      </span>
                      {notice.format === 'pdf' && (
                        <span style={{
                          padding: '4px 12px',
                          background: '#ffe0e0',
                          color: '#c62828',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          minWidth: '50px',
                          textAlign: 'center'
                        }}>
                          PDF
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
