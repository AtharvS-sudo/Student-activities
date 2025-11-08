import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AcademicNotices from './pages/AcademicNotices';
import ClubActivities from './pages/ClubActivities';
import CreateNotice from './pages/CreateNotice';
import NoticeDetail from './pages/NoticeDetail';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
              <Route path="/academic" element={<><Navbar /><AcademicNotices /></>} />
              <Route path="/clubs" element={<><Navbar /><ClubActivities /></>} />
              <Route path="/notice/:id" element={<><Navbar /><NoticeDetail /></>} />
              <Route path="/create-notice" element={<><Navbar /><CreateNotice /></>} />
              <Route path="/admin" element={<><Navbar /><AdminPanel /></>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
