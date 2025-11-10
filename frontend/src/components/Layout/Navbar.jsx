import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <h1>Student Activities</h1>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/academic">Academic</Link>
        <Link to="/clubs">Clubs</Link>
        
        {(user.role === 'admin' || user.role === 'faculty' || user.role === 'club_member') && (
          <Link to="/create-notice">Create Notice</Link>
        )}
        
        {user.additionalRoles && user.additionalRoles.length > 0 && user.additionalRoles.includes('club_head') && (
          <Link to="/manage-club">Manage Club</Link>
        )}
        
        {user.role === 'admin' && <Link to="/admin">Admin</Link>}
        
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiUser size={16} />
          Profile
        </Link>
        
        <span>{user.name}</span>
        <button 
          onClick={handleLogout} 
          className="btn btn-danger" 
          style={{ padding: '8px 16px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
