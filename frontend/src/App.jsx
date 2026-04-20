import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AcademicNotices from './pages/AcademicNotices';
import ClubActivities from './pages/ClubActivities';
import CreateNotice from './pages/CreateNotice';
import EditNotice from './pages/EditNotice';
import NoticeDetail from './pages/NoticeDetail';
import Profile from './pages/Profile';
import ManageClub from './pages/ManageClub';
import AdminPanel from './pages/AdminPanel';
import ActivityLogs from './pages/ActivityLogs';
import ClubChat from './pages/ClubChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
              <Route path="/academic" element={<><Navbar /><AcademicNotices /></>} />
              <Route path="/clubs" element={<><Navbar /><ClubActivities /></>} />
              <Route path="/notice/:id" element={<><Navbar /><NoticeDetail /></>} />
              <Route path="/notice/:id/edit" element={<><Navbar /><EditNotice /></>} />
              <Route path="/create-notice" element={<><Navbar /><CreateNotice /></>} />
              <Route path="/profile" element={<><Navbar /><Profile /></>} />
              <Route path="/manage-club" element={<><Navbar /><ManageClub /></>} />
              <Route path="/admin" element={<><Navbar /><AdminPanel /></>} />
              <Route path="/activity-logs" element={<><Navbar /><ActivityLogs /></>} />
              <Route path="/club-chat" element={<><Navbar /><ClubChat /></>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
