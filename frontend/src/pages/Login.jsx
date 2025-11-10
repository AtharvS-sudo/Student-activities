import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useForm } from '../hooks';
import { FiMail, FiLock } from 'react-icons/fi';
import styles from '../styles/Auth.module.css';

const Login = () => {
  const { values: formData, handleChange } = useForm({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Check if faculty user has valid email domain
      if (result.user?.role === 'faculty' && !formData.email.endsWith('@vit.edu')) {
        setError('Faculty email must end with @vit.edu');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your Student Activities account</p>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
