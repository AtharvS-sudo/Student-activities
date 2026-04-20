import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchLogs();
    if (isAdmin) {
      fetchStats();
    }
  }, [filters.page, filters.action]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/activity-logs' : '/activity-logs/my-activity';
      console.log('Fetching logs from:', endpoint, 'with filters:', filters);
      const response = await api.get(endpoint, { params: filters });
      console.log('Logs response:', response.data);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/activity-logs/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchLogs();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      login: '#28a745',
      logout: '#6c757d',
      failed_login: '#dc3545',
      create_notice: '#007bff',
      edit_notice: '#ffc107',
      delete_notice: '#dc3545',
      approve_application: '#28a745',
      reject_application: '#dc3545',
    };
    return colors[action] || '#6c757d';
  };

  const getActionLabel = (action) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && logs.length === 0) {
    return <div className="loading">Loading activity logs...</div>;
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1 style={{ 
        marginBottom: '30px', 
        color: '#1e3c72', 
        fontSize: '32px', 
        fontWeight: '700' 
      }}>
        {isAdmin ? 'System Activity Logs' : 'My Activity History'}
      </h1>

      {!isAdmin && (
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #90caf9',
        }}>
          <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
            ℹ️ Login and logout activities are only visible to administrators for security purposes.
          </p>
        </div>
      )}

      {isAdmin && stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              Total Activities
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e3c72' }}>
              {stats.totalLogs}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              Failed Logins
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.recentFailedLogins.length}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              Unique IPs
            </h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.topIPs.length}
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}>
          <h3 style={{ marginTop: 0 }}>Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                Action
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                }}
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="failed_login">Failed Login</option>
                <option value="register">Register</option>
                <option value="create_notice">Create Notice</option>
                <option value="edit_notice">Edit Notice</option>
                <option value="delete_notice">Delete Notice</option>
                <option value="pin_notice">Pin Notice</option>
                <option value="apply_club">Apply to Club</option>
                <option value="approve_application">Approve Application</option>
                <option value="reject_application">Reject Application</option>
                <option value="change_user_role">Change User Role</option>
                <option value="grant_privileges">Grant Privileges</option>
                <option value="delete_user">Delete User</option>
                <option value="remove_member">Remove Member</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                IP Address
              </label>
              <input
                type="text"
                name="ipAddress"
                value={filters.ipAddress}
                onChange={handleFilterChange}
                placeholder="Search by IP"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#2a5298',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Apply Filters
          </button>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Timestamp</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Action</th>
              {isAdmin && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>User</th>}
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>IP Address</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '15px', fontSize: '14px' }}>
                  {formatDate(log.timestamp)}
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getActionColor(log.action) + '20',
                    color: getActionColor(log.action),
                  }}>
                    {getActionLabel(log.action)}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ padding: '15px', fontSize: '14px' }}>
                    {log.user?.name || 'Unknown'}
                    <br />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {log.user?.email}
                    </span>
                  </td>
                )}
                <td style={{ padding: '15px', fontSize: '14px', fontFamily: 'monospace' }}>
                  {log.ipAddress}
                </td>
                <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                  {log.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No activity logs found
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
