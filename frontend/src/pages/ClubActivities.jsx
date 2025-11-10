import React, { useState, useEffect } from 'react';
import NoticeList from '../components/Notice/NoticeList';
import api from '../services/api';
import { useAuth } from '../hooks';
import { FiUsers, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const ClubActivities = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchClubs();
    if (isStudent) {
      fetchMyApplications();
    }
  }, [isStudent]);

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(response.data.clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/club-applications/my-applications');
      setMyApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = (club) => {
    setSelectedClub(club);
    setReason('');
    setShowModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/club-applications', {
        club: selectedClub._id,
        reason,
      });
      alert('Application submitted successfully!');
      setShowModal(false);
      fetchMyApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fff3cd', color: '#856404', icon: FiClock },
      approved: { bg: '#d4edda', color: '#155724', icon: FiCheckCircle },
      rejected: { bg: '#f8d7da', color: '#721c24', icon: FiXCircle },
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <span style={{
        padding: '4px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Icon size={14} />
        {status.toUpperCase()}
      </span>
    );
  };

  const hasApplied = (clubId) => {
    return myApplications.some(app => 
      app.club._id === clubId && (app.status === 'pending' || app.status === 'approved')
    );
  };

  return (
    <div className="container">
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700' 
      }}>
        Club Activities
      </h1>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '400px 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column - Apply to Clubs Section (Students Only) */}
        {isStudent && (
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e3c72',
            marginBottom: '20px' 
          }}>
            <FiUsers style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Apply to Clubs
          </h2>

          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '20px',
            maxHeight: '500px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {clubs.map(club => (
              <div key={club._id} style={{
                background: 'white',
                border: '1px solid #e8ecf1',
                borderRadius: '10px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#1e3c72',
                  marginBottom: '6px' 
                }}>
                  {club.name}
                </h3>
                <span style={{
                  padding: '3px 8px',
                  background: '#e3f2fd',
                  color: '#1565c0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  {club.category.toUpperCase()}
                </span>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {club.description || 'No description available'}
                </p>
                <button
                  onClick={() => handleApply(club)}
                  disabled={hasApplied(club._id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: hasApplied(club._id) ? '#ccc' : '#2a5298',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: hasApplied(club._id) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {hasApplied(club._id) ? 'Already Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>

          {/* My Applications */}
          {myApplications.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#1e3c72',
                marginBottom: '12px' 
              }}>
                My Applications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myApplications.map(app => (
                  <div key={app._id} style={{
                    background: 'white',
                    border: '1px solid #e8ecf1',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1e3c72',
                        marginBottom: '2px' 
                      }}>
                        {app.club.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Right Column - Club Notices */}
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e3c72',
            marginBottom: '20px' 
          }}>
            Club Notices
          </h2>
          <NoticeList type="club" />
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#1e3c72',
              marginBottom: '20px' 
            }}>
              Apply to {selectedClub?.name}
            </h3>
            <form onSubmit={submitApplication}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px' 
                }}>
                  Why do you want to join this club?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                  placeholder="Tell us why you're interested in joining..."
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: '#2a5298',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubActivities;
