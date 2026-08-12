import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../pages/HomePage.css'; // Make sure styles apply

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return scrolled;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const scrolled = useNavScroll();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      login();
    }
  };

  return (
    <nav className={`hp-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="hp-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" className="hp-nav-brand">
            <Activity size={20} className="hp-nav-brand-icon" />
            DevPilot
          </Link>
          <div className="hp-nav-status">
            <span className="hp-status-dot" />
            AI Engine Online
          </div>
        </div>

        <ul className="hp-nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/how-it-works">How it works</Link></li>
          <li><Link to="/preview">Preview</Link></li>
        </ul>

        <div className="hp-nav-actions">
          <button className="hp-btn-primary" onClick={handleLogin}>
            {isAuthenticated ? (
              <>Go to Dashboard <ArrowRight size={14} /></>
            ) : (
              <>Get Started <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
