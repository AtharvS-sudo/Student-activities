import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useDepartments, useClubs, useForm } from '../hooks';
import { FiUser, FiMail, FiLock, FiBook, FiUsers } from 'react-icons/fi';
import styles from '../styles/Auth.module.css';

const Register = () => {
  const { values: formData, handleChange } = useForm({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    club: '',
  });
  
  const { departments } = useDepartments();
  const { clubs } = useClubs();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join Student Activities today</p>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
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
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
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
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
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
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiUsers size={18} color="#2a5298" />
              User Role
            </label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              required
              className={styles.select}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiBook size={18} color="#2a5298" />
              Department (Optional)
            </label>
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

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
