import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const GithubIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleConnect = () => {
    login();
  };

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <Activity className="nav-logo" size={24} />
          <span>Antigravity</span>
        </div>
        
        <button className="github-connect-btn" onClick={handleConnect}>
          <GithubIcon className="hero-cta-icon" />
          Connect GitHub
        </button>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-badge">Autonomous DevOps AI</div>
        
        <h1 className="hero-title">
          Your AI Engineer for Autonomous DevOps.
        </h1>
        
        <p className="hero-subtitle">
          Connect your repository. We analyze failures, write code fixes, run your tests, and push branches automatically.
        </p>
        
        <button className="hero-cta" onClick={handleConnect}>
          Start Free Trial
          <ArrowRight className="hero-cta-icon" />
        </button>
      </main>
    </div>
  );
};

export default HomePage;
