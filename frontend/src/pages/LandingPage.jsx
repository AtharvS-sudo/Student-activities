import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUsers, FiMessageCircle, FiShield, FiZap, FiActivity } from 'react-icons/fi';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiBell size={32} />,
      title: 'Instant Notifications',
      description: 'Get academic and club notices delivered instantly. No more missed announcements.',
      color: '#2a5298'
    },
    {
      icon: <FiUsers size={32} />,
      title: 'Club Management',
      description: 'Apply to clubs, manage memberships, and coordinate activities seamlessly.',
      color: '#28a745'
    },
    {
      icon: <FiMessageCircle size={32} />,
      title: 'Real-time Chat',
      description: 'Instant messaging for club members with typing indicators and online presence.',
      color: '#ffc107'
    },
    {
      icon: <FiShield size={32} />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with JWT authentication and comprehensive audit trails.',
      color: '#dc3545'
    },
    {
      icon: <FiZap size={32} />,
      title: 'Lightning Fast',
      description: 'Optimized performance with <100ms response times and real-time updates.',
      color: '#17a2b8'
    },
    {
      icon: <FiActivity size={32} />,
      title: 'Activity Monitoring',
      description: 'Complete transparency with activity logs and security monitoring.',
      color: '#6f42c1'
    }
  ];

  const stats = [
    { number: '100%', label: 'Faster Distribution', description: 'Days to Instant' },
    { number: '96%', label: 'Time Saved', description: '5 days to 2 hours' },
    { number: '<100ms', label: 'Chat Latency', description: 'Real-time messaging' },
    { number: '4', label: 'User Roles', description: 'Flexible permissions' }
  ];

  const roles = [
    {
      title: 'Students',
      description: 'Access personalized notices, apply to clubs, and chat with club members.',
      benefits: ['Department-specific notices', 'One-click club applications', 'Real-time club chat', 'Activity history']
    },
    {
      title: 'Faculty',
      description: 'Create and manage notices, target specific departments, and track engagement.',
      benefits: ['Create notices instantly', 'Department targeting', 'PDF attachments', 'Edit capabilities']
    },
    {
      title: 'Club Heads',
      description: 'Manage applications, communicate with members, and post club updates.',
      benefits: ['Review applications', 'Member management', 'Club chat moderation', 'Post club notices']
    },
    {
      title: 'Administrators',
      description: 'Full system control with user management and comprehensive analytics.',
      benefits: ['User management', 'Activity monitoring', 'Security analytics', 'System configuration']
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Centralize Your Campus
              <span className="gradient-text"> Communication</span>
            </h1>
            <p className="hero-subtitle">
              A modern platform for student activities, club management, and institutional communication.
              Built with advanced networking features and real-time collaboration.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
            <div className="hero-badges">
              <span className="badge">🚀 MERN Stack</span>
              <span className="badge">⚡ Real-time</span>
              <span className="badge">🔒 Secure</span>
              <span className="badge">📱 Responsive</span>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <FiBell size={24} color="#2a5298" />
              <div>
                <strong>New Notice</strong>
                <p>Exam schedule updated</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <FiUsers size={24} color="#28a745" />
              <div>
                <strong>Application Approved</strong>
                <p>Welcome to Tech Club!</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <FiMessageCircle size={24} color="#ffc107" />
              <div>
                <strong>3 new messages</strong>
                <p>Club chat is active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage student activities and institutional communication
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built for Everyone</h2>
            <p className="section-subtitle">
              Tailored experiences for every role in your institution
            </p>
          </div>
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div key={index} className="role-card">
                <h3 className="role-title">{role.title}</h3>
                <p className="role-description">{role.description}</p>
                <ul className="role-benefits">
                  {role.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="tech-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built with Modern Technology</h2>
            <p className="section-subtitle">
              Leveraging cutting-edge networking protocols and security practices
            </p>
          </div>
          <div className="tech-grid">
            <div className="tech-card">
              <h4>WebSocket Protocol</h4>
              <p>Full-duplex real-time communication with &lt;100ms latency for instant messaging</p>
            </div>
            <div className="tech-card">
              <h4>Token Bucket Algorithm</h4>
              <p>Advanced rate limiting preventing API abuse while allowing legitimate burst traffic</p>
            </div>
            <div className="tech-card">
              <h4>JWT Authentication</h4>
              <p>Stateless authentication enabling horizontal scaling and secure access control</p>
            </div>
            <div className="tech-card">
              <h4>Activity Logging</h4>
              <p>Comprehensive audit trails with IP tracking for security monitoring and compliance</p>
            </div>
            <div className="tech-card">
              <h4>RESTful API</h4>
              <p>Clean, scalable API architecture with 50+ endpoints and middleware pipeline</p>
            </div>
            <div className="tech-card">
              <h4>MongoDB</h4>
              <p>Flexible document database with strategic indexing for optimized performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Campus Communication?</h2>
            <p className="cta-subtitle">
              Join institutions using modern technology to streamline student activities
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Student Activities System</h3>
              <p>Modern platform for institutional communication and club management</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Notice Management</li>
                <li>Club Applications</li>
                <li>Real-time Chat</li>
                <li>Activity Monitoring</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Technology</h4>
              <ul>
                <li>MERN Stack</li>
                <li>WebSocket</li>
                <li>JWT Auth</li>
                <li>Rate Limiting</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/login">Sign In</a></li>
                <li><a href="/register">Register</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#tech">Technology</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Student Activities Management System. Built with ❤️ using MERN Stack.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
