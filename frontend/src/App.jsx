import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage, { FeaturesPage, HowItWorksPage, PreviewPage } from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import PublicLayout from './components/PublicLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Protect routes that require login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex-center" style={{ height: '100vh' }}>Loading session...</div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public route — accessible to everyone, including logged-in users
const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages with Shared Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
            <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
            <Route path="/how-it-works" element={<PublicRoute><HowItWorksPage /></PublicRoute>} />
            <Route path="/preview" element={<PublicRoute><PreviewPage /></PublicRoute>} />
          </Route>

          {/* Protected App Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
