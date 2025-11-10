import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import api from '../services/api';
import { FiUser, FiMail, FiShield, FiBook, FiUsers } from 'react-icons/fi';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container">Failed to load profile</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700',
        textAlign: 'center'
      }}>
        My Profile
      </h1>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '40px',
          paddingBottom: '30px',
          borderBottom: '2px solid #f0f0f0',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: '700',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e3c72',
              marginBottom: '4px' 
            }}>
              {user.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Email */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '10px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FiMail size={20} color="#2a5298" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#999', 
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email Address
              </p>
              <p style={{ fontSize: '16px', color: '#333', margin: 0, fontWeight: '500' }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Primary Role */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '10px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FiShield size={20} color="#2e7d32" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#999', 
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Primary Role
              </p>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#2a5298',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Additional Roles */}
          {user.additionalRoles && user.additionalRoles.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FiUsers size={20} color="#f57c00" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginBottom: '8px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Additional Roles
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {user.additionalRoles.map(role => (
                    <span key={role} style={{
                      padding: '6px 14px',
                      background: '#ff9800',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}>
                      {role === 'club_member' ? 'Club Member' : 'Club Head'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department */}
          {user.department && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fce4ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FiBook size={20} color="#c2185b" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginBottom: '4px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Department
                </p>
                <p style={{ fontSize: '16px', color: '#333', margin: 0, fontWeight: '500' }}>
                  {user.department.name}
                  {user.department.code && (
                    <span style={{ color: '#999', marginLeft: '8px' }}>
                      ({user.department.code})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Club */}
          {user.club && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FiUsers size={20} color="#7b1fa2" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginBottom: '4px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Club
                </p>
                <p style={{ fontSize: '16px', color: '#333', margin: 0, fontWeight: '500' }}>
                  {user.club.name}
                  {user.club.category && (
                    <span style={{ 
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: '#e1bee7',
                      color: '#6a1b9a',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {user.club.category}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Posting Privilege */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '16px',
            background: user.canPost ? '#e8f5e9' : '#f8f9fa',
            borderRadius: '10px',
            border: user.canPost ? '2px solid #4caf50' : 'none',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: user.canPost ? '#c8e6c9' : '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FiShield size={20} color={user.canPost ? '#2e7d32' : '#757575'} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#999', 
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Posting Privilege
              </p>
              <p style={{ 
                fontSize: '16px', 
                color: user.canPost ? '#2e7d32' : '#757575', 
                margin: 0, 
                fontWeight: '600' 
              }}>
                {user.canPost ? '✓ Enabled - You can create notices' : '✗ Not enabled'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
