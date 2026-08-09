import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const mockRepos = [
  { id: 1, name: 'ecommerce-api', desc: 'Backend API for the main storefront, built with Node.js and Express.', lang: 'JavaScript', updated: '2 hours ago' },
  { id: 2, name: 'frontend-web', desc: 'React-based frontend application for customer facing web portal.', lang: 'TypeScript', updated: '5 hours ago' },
  { id: 3, name: 'billing-service', desc: 'Microservice handling Stripe integrations and invoicing.', lang: 'Go', updated: '1 day ago' },
  { id: 4, name: 'auth-gateway', desc: 'Authentication and authorization proxy.', lang: 'Rust', updated: '3 days ago' },
];

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Repositories</h1>
          <p className="dashboard-subtitle">Select a repository to analyze or trigger an autonomous repair.</p>
        </div>
        <button 
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="repo-grid">
        {mockRepos.map(repo => (
          <div key={repo.id} className="repo-card" onClick={() => console.log(`Selected ${repo.name}`)}>
            <div className="repo-header">
              <BookOpen className="repo-icon" size={20} />
              <span className="repo-name">{repo.name}</span>
            </div>
            <p className="repo-desc">{repo.desc}</p>
            <div className="repo-footer">
              <div className="repo-lang">
                <span className="lang-dot" style={{ 
                  backgroundColor: repo.lang === 'JavaScript' ? '#f1e05a' : 
                                 repo.lang === 'TypeScript' ? '#3178c6' : 
                                 repo.lang === 'Go' ? '#00ADD8' : '#dea584'
                }}></span>
                {repo.lang}
              </div>
              <span>Updated {repo.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
