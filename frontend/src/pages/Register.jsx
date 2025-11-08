import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiUser, FiMail, FiLock, FiBook, FiUsers } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    club: '',
  });
  const [departments, setDepartments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.department && formData.department !== '') {
      cleanData.department = formData.department;
    }

    if (formData.club && formData.club !== '') {
      cleanData.club = formData.club;
    }

    const result = await register(cleanData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join Student Activities today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiUser size={18} color="#2a5298" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiMail size={18} color="#2a5298" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiLock size={18} color="#2a5298" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiUsers size={18} color="#2a5298" />
              User Role
            </label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="club_member">Club Member</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiBook size={18} color="#2a5298" />
              Department (Optional)
            </label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50' }}>
              <FiUsers size={18} color="#2a5298" />
              Club (Optional)
            </label>
            <select name="club" value={formData.club} onChange={handleChange}>
              <option value="">Select Club</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
