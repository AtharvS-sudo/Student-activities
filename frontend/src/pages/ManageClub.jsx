import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import api from '../services/api';
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiMail, FiBook } from 'react-icons/fi';

const ManageClub = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchApplications();
    fetchMembers();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/club-applications/club-head');
      setApplications(response.data.applications);
      setClub(response.data.club);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert(error.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/club-applications/club-head');
      const clubId = response.data.club._id;
      const membersResponse = await api.get(`/users/club-members/${clubId}`);
      setMembers(membersResponse.data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) return;

    try {
      await api.delete(`/users/club-members/${memberId}`);
      fetchMembers();
      alert('Member removed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleReview = async (applicationId, status) => {
    const confirmMessage = status === 'approved' 
      ? 'Are you sure you want to approve this application?' 
      : 'Are you sure you want to reject this application?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.patch(`/club-applications/${applicationId}`, { status });
      fetchApplications();
      alert(`Application ${status} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update application');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fff3cd', color: '#856404', icon: FiClock, text: 'Pending' },
      approved: { bg: '#d4edda', color: '#155724', icon: FiCheckCircle, text: 'Approved' },
      rejected: { bg: '#f8d7da', color: '#721c24', icon: FiXCircle, text: 'Rejected' },
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <span style={{
        padding: '6px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Icon size={14} />
        {style.text}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          color: '#1e3c72', 
          fontSize: '32px', 
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          Manage Club Applications
        </h1>
        {club && (
          <p style={{ fontSize: '16px', color: '#666' }}>
            <FiUsers style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {club.name} - {club.category}
          </p>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #2a5298'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Applications</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e3c72', margin: 0 }}>
            {stats.total}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ff9800'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#f57c00', margin: 0 }}>
            {stats.pending}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #4caf50'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Approved</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#2e7d32', margin: 0 }}>
            {stats.approved}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f44336'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Rejected</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#c62828', margin: 0 }}>
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'applications' ? '#2a5298' : '#666',
            border: 'none',
            borderBottom: activeTab === 'applications' ? '3px solid #2a5298' : '3px solid transparent',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          Applications ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'members' ? '#2a5298' : '#666',
            border: 'none',
            borderBottom: activeTab === 'members' ? '3px solid #2a5298' : '3px solid transparent',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          Members ({members.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          {/* Filter Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 20px',
            background: filter === 'all' ? '#2a5298' : 'white',
            color: filter === 'all' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '10px 20px',
            background: filter === 'pending' ? '#ff9800' : 'white',
            color: filter === 'pending' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            padding: '10px 20px',
            background: filter === 'approved' ? '#4caf50' : 'white',
            color: filter === 'approved' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          style={{
            padding: '10px 20px',
            background: filter === 'rejected' ? '#f44336' : 'white',
            color: filter === 'rejected' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Applications List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {filteredApplications.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#999', fontSize: '16px' }}>
              No applications found
            </p>
          </div>
        ) : (
          <div>
            {filteredApplications.map(application => (
              <div key={application._id} style={{
                padding: '24px',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: '#1e3c72',
                        margin: 0
                      }}>
                        {application.student.name}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMail size={14} />
                        {application.student.email}
                      </p>
                      {application.student.department && (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiBook size={14} />
                          {application.student.department.name}
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                        Applied on {new Date(application.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div style={{
                      background: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ fontSize: '13px', color: '#999', marginBottom: '6px', fontWeight: '600' }}>
                        Reason for joining:
                      </p>
                      <p style={{ fontSize: '14px', color: '#333', margin: 0, lineHeight: '1.6' }}>
                        {application.reason}
                      </p>
                    </div>

                    {application.reviewedBy && (
                      <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                        Reviewed by {application.reviewedBy.name} on {new Date(application.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {application.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleReview(application._id, 'approved')}
                        style={{
                          padding: '10px 20px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FiCheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(application._id, 'rejected')}
                        style={{
                          padding: '10px 20px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FiXCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {members.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ color: '#999', fontSize: '16px' }}>
                No members in this club yet
              </p>
            </div>
          ) : (
            <div>
              {members.map(member => (
                <div key={member._id} style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: '#1e3c72',
                      marginBottom: '8px' 
                    }}>
                      {member.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMail size={14} />
                        {member.email}
                      </p>
                      {member.department && (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiBook size={14} />
                          {member.department.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member._id, member.name)}
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiXCircle size={14} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageClub;
