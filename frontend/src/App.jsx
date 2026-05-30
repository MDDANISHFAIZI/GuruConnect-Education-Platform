import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NearbyDiscovery from './pages/NearbyDiscovery';
import TeacherProfile from './pages/TeacherProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import CreatorPage from './pages/CreatorPage';
import { useAuth } from './context/AuthContext';

// Protected Route wrapper checking authentication and role limits
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/student" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own dashboard if role mismatches
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
        
        {/* Persistent bilingual navigation */}
        <Navbar />
        
        {/* Route views content */}
        <main className="flex-grow">
          <Routes>
            {/* Public paths */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Separate student and teacher login & registration routes */}
            <Route path="/login/student" element={<Login role="student" />} />
            <Route path="/login/teacher" element={<Login role="teacher" />} />
            <Route path="/student-login" element={<Login role="student" />} />
            <Route path="/teacher-login" element={<Login role="teacher" />} />
            <Route path="/register/student" element={<Register role="student" />} />
            <Route path="/register/teacher" element={<Register role="teacher" />} />
            <Route path="/signup/student" element={<Register role="student" />} />
            <Route path="/signup/teacher" element={<Register role="teacher" />} />
            
            {/* Direct fallbacks */}
            <Route path="/login" element={<Navigate to="/login/student" replace />} />
            <Route path="/register" element={<Navigate to="/register/student" replace />} />
            <Route path="/signup" element={<Navigate to="/signup/student" replace />} />

            <Route path="/nearby" element={<NearbyDiscovery />} />
            <Route path="/creator" element={<CreatorPage />} />
            <Route path="/teacher-profile/:id" element={<TeacherProfile />} />

            {/* Protected dashboard portals */}
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-profile/:id" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Responsive footer */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;
