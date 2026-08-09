import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Search, BookOpen, Lock, Globe, ArrowRight, LogOut, Loader, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRepositories } from '../api/github';
import './Dashboard.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
};

const RepoSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="repo-skeleton">
        <div className="skeleton-line skeleton-icon" />
        <div className="skeleton-text">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    ))}
  </>
);

const formatUpdated = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const searchTimer = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setRepos([]);
      setHasMore(true);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Fetch repos whenever page or debounced search changes
  useEffect(() => {
    const fetchRepos = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const data = await getRepositories({ page, search: debouncedSearch });
        setRepos(prev => page === 1 ? data : [...prev, ...data]);
        // Backend returns 30 per page; if fewer, we've reached the end
        if (data.length < 30) setHasMore(false);
      } catch (err) {
        setError('Failed to fetch repositories. Make sure you are connected to the backend.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchRepos();
  }, [page, debouncedSearch]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) setPage(p => p + 1);
  };

  const handleImport = (repo) => {
    console.log('Importing repo:', repo.fullName);
    // TODO: Navigate to job creation page with this repo pre-selected
    alert(`Starting analysis for ${repo.fullName}...`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sticky Navbar */}
      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <Activity className="dash-nav-logo" size={20} />
          <span>Antigravity</span>
        </div>
        <div className="dash-nav-right">
          <button className="dash-logout-btn" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-page-header">
          <h1 className="dash-page-title">Select a Repository</h1>
          <p className="dash-page-subtitle">
            Choose a GitHub repository to analyze. The AI agent will diagnose failures and generate fixes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="repo-search-wrapper">
          <Search className="repo-search-icon" size={16} />
          <input
            type="text"
            className="repo-search-input"
            placeholder="Search repositories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Repo List */}
        <div className="repo-list">
          {loading ? (
            <RepoSkeleton />
          ) : error ? (
            <div className="repo-error">{error}</div>
          ) : repos.length === 0 ? (
            <div className="repo-empty">
              <Package size={40} className="repo-empty-icon" />
              <p>No repositories found{search ? ` for "${search}"` : ''}.</p>
            </div>
          ) : (
            <>
              {repos.map(repo => (
                <div key={repo.id} className="repo-item">
                  <div className="repo-item-left">
                    <div className="repo-item-icon-wrap">
                      {repo.private ? <Lock size={16} /> : <BookOpen size={16} />}
                    </div>
                    <div className="repo-item-info">
                      <div className="repo-item-name">{repo.fullName}</div>
                      <div className="repo-item-desc">{repo.description || 'No description'}</div>
                    </div>
                  </div>

                  <div className="repo-item-right">
                    <div className="repo-meta">
                      {repo.language && (
                        <span className="repo-lang">
                          <span
                            className="lang-dot"
                            style={{ backgroundColor: LANG_COLORS[repo.language] || '#888' }}
                          />
                          {repo.language}
                        </span>
                      )}
                      <span>{formatUpdated(repo.updatedAt)}</span>
                      <span className={`repo-badge ${repo.private ? 'private' : 'public'}`}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    <button
                      className="repo-import-btn"
                      onClick={() => handleImport(repo)}
                    >
                      Analyze
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="load-more-wrapper">
                  <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? (
                      <><Loader size={14} className="spinner" /> Loading...</>
                    ) : (
                      <>Load more</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
