import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, GitBranch, GitPullRequest,
  Terminal, Zap, Shield, RefreshCw, CheckCircle2,
  Search, Cpu, Code2, TestTube, Bug,
  Layers, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const buildData = [
  { run: 'Run 1', before: 42, after: 42 },
  { run: 'Run 2', before: 38, after: 55 },
  { run: 'Run 3', before: 44, after: 68 },
  { run: 'Run 4', before: 35, after: 74 },
  { run: 'Run 5', before: 40, after: 82 },
  { run: 'Run 6', before: 37, after: 88 },
  { run: 'Run 7', before: 43, after: 94 },
];

const resolutionData = [
  { method: 'Manual', hours: 4.2 },
  { method: 'AI Agent', hours: 0.9 },
];

const TERMINAL_LINES = [
  { text: '$ devpilot analyze github.com/user/payment-service', type: 'cmd', delay: 0 },
  { text: '✓ Repository cloned successfully', type: 'ok', delay: 600 },
  { text: '✓ 184 files analyzed', type: 'ok', delay: 1000 },
  { text: '✓ 327 tests discovered', type: 'ok', delay: 1400 },
  { text: '⚠  3 failing tests detected', type: 'warn', delay: 1900 },
  { text: 'AI Agent: Inspecting stack trace...', type: 'agent', delay: 2500 },
  { text: 'AI Agent: Tracing dependency chain...', type: 'agent', delay: 3200 },
  { text: 'AI Agent: Generating targeted patch...', type: 'agent', delay: 3900 },
  { text: 'AI Agent: Running full test suite...', type: 'agent', delay: 4600 },
  { text: '✓ 327/327 tests passed', type: 'ok', delay: 5400 },
  { text: '→ Creating branch: agent/fix-authentication', type: 'branch', delay: 6000 },
  { text: '→ Commit: [AI-AGENT] fix authentication middleware', type: 'branch', delay: 6600 },
  { text: '→ Push completed', type: 'branch', delay: 7100 },
  { text: '✓ Pull request ready — CI passed', type: 'ok', delay: 7700 },
];

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return scrolled;
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseFloat(target);
        const dur = 1800, steps = 60;
        let s = 0;
        const inc = num / steps;
        const t = setInterval(() => {
          s++;
          const cur = Math.min(inc * s, num);
          setVal(Number.isInteger(num) ? Math.round(cur) : parseFloat(cur.toFixed(1)));
          if (s >= steps) clearInterval(t);
        }, dur / steps);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────────────────
   TERMINAL DEMO
───────────────────────────────────────── */
function TerminalDemo() {
  const [visible, setVisible] = useState([]);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        TERMINAL_LINES.forEach((line) => {
          setTimeout(() => setVisible(p => [...p, line]), line.delay);
        });
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const typeClass = (type) => {
    const m = { cmd: 'hp-t-cmd', ok: 'hp-t-ok', warn: 'hp-t-warn', agent: 'hp-t-agent', branch: 'hp-t-branch' };
    return m[type] || '';
  };

  return (
    <div ref={ref} className="hp-terminal-wrap">
      <div className="hp-terminal-topbar">
        <span className="hp-terminal-dot red" />
        <span className="hp-terminal-dot amber" />
        <span className="hp-terminal-dot green" />
        <span className="hp-terminal-title">devpilot — autonomous agent</span>
      </div>
      <div className="hp-terminal-body">
        {visible.map((line, i) => (
          <div key={i}>
            {line.type === 'cmd' && <><span className="hp-t-prompt">~ </span><span className={typeClass(line.type)}>{line.text.slice(2)}</span></>}
            {line.type !== 'cmd' && <span className={typeClass(line.type)}>{line.text}</span>}
          </div>
        ))}
        {visible.length < TERMINAL_LINES.length && <span className="hp-cursor" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   GITHUB ICON SVG
───────────────────────────────────────── */
const GithubSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* ─────────────────────────────────────────
   AGENT VISUALIZATION
───────────────────────────────────────── */
function AgentVisualization() {
  return (
    <div className="hp-viz">
      <div className="hp-viz-card">
        <div className="hp-viz-nodes">
          {/* GitHub */}
          <div className="hp-viz-row">
            <div className="hp-viz-node" style={{ animationDelay: '0s' }}>
              <GithubSvg size={20} />
              <span className="hp-viz-node-label">GitHub Repo</span>
            </div>
          </div>
          <div className="hp-viz-connector" />

          {/* AI Analyzer */}
          <div className="hp-viz-row">
            <div className="hp-viz-node active" style={{ animationDelay: '0.5s', minWidth: 180 }}>
              <Cpu size={20} />
              <span className="hp-viz-node-label">AI Analyzer</span>
            </div>
          </div>
          <div className="hp-viz-connector" />

          {/* Triple: Tests, Code, Logs */}
          <div className="hp-viz-triple">
            <div className="hp-viz-node" style={{ animationDelay: '1s' }}>
              <TestTube size={18} />
              <span className="hp-viz-node-label">Tests</span>
            </div>
            <div className="hp-viz-connector-h" />
            <div className="hp-viz-node" style={{ animationDelay: '1.5s' }}>
              <Code2 size={18} />
              <span className="hp-viz-node-label">Code</span>
            </div>
            <div className="hp-viz-connector-h" />
            <div className="hp-viz-node" style={{ animationDelay: '2s' }}>
              <Terminal size={18} />
              <span className="hp-viz-node-label">Logs</span>
            </div>
          </div>
          <div className="hp-viz-connector" />

          {/* Fix Engine */}
          <div className="hp-viz-row">
            <div className="hp-viz-node active" style={{ animationDelay: '2.5s', minWidth: 180 }}>
              <Zap size={20} />
              <span className="hp-viz-node-label">AI Fix Engine</span>
            </div>
          </div>
          <div className="hp-viz-connector" />

          {/* CI/CD Passed */}
          <div className="hp-viz-row">
            <div className="hp-viz-node success" style={{ animationDelay: '3s' }}>
              <CheckCircle2 size={20} />
              <span className="hp-viz-node-label">CI/CD</span>
              <span className="hp-viz-badge pass">Passed ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD PREVIEW
───────────────────────────────────────── */
function DashboardPreview() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="hp-reveal hp-preview-frame">
      <div className="hp-preview-bar">
        <span className="hp-preview-dot r" />
        <span className="hp-preview-dot a" />
        <span className="hp-preview-dot g" />
        <span className="hp-preview-url">devpilot.app/dashboard/payment-service</span>
      </div>
      <div className="hp-preview-body">
        {/* Sidebar */}
        <div className="hp-preview-sidebar">
          <div className="hp-preview-label">Pipeline</div>
          <div className="hp-pipeline-list">
            {[
              { label: 'Clone Repository', state: 'done' },
              { label: 'Environment Check', state: 'done' },
              { label: 'Analyze Codebase', state: 'done' },
              { label: 'Test Discovery', state: 'done' },
              { label: 'Run Test Suite', state: 'done' },
              { label: 'AI Diagnosis', state: 'active' },
              { label: 'Generate Fix', state: 'pending' },
              { label: 'Verify Fix', state: 'pending' },
              { label: 'Create PR', state: 'pending' },
            ].map((item, i) => (
              <div key={i} className={`hp-pipeline-item ${item.state === 'pending' ? '' : item.state}`}>
                <span className="hp-pip-dot" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="hp-preview-center">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div className="hp-preview-repo">github.com/company/payment-service</div>
              <div className="hp-preview-title-text">Active Job #A19F3</div>
            </div>
            <span className="hp-status-chip running">CI Running</span>
          </div>

          <div className="hp-preview-label">Test Summary</div>
          <div className="hp-test-stats">
            <div className="hp-test-row">
              <span className="label">Passed</span>
              <div className="hp-test-bar-wrap">
                <div className="hp-test-bar" style={{ width: '100%', background: 'var(--accent-green)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>327</span>
            </div>
            <div className="hp-test-row">
              <span className="label">Failed</span>
              <div className="hp-test-bar-wrap">
                <div className="hp-test-bar" style={{ width: '0%', background: 'var(--status-error)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0 (→ fixed)</span>
            </div>
          </div>

          <div className="hp-preview-label" style={{ marginTop: 24 }}>Pull Request</div>
          <div className="hp-pr-card">
            <div className="hp-pr-branch">agent/fix-authentication</div>
            <div className="hp-pr-commit">[AI-AGENT] fix authentication middleware</div>
            <div className="hp-pr-checks">
              <div className="hp-pr-check"><CheckCircle2 size={12} /> 327 tests passing</div>
              <div className="hp-pr-check"><CheckCircle2 size={12} /> Code analysis complete</div>
              <div className="hp-pr-check"><CheckCircle2 size={12} /> CI pipeline passed</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hp-preview-right">
          <div className="hp-preview-label">Agent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              'Analyzing repository',
              'Finding failing tests',
              'Inspecting auth middleware',
              'Generating patch',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === 3 ? '#818cf8' : 'var(--accent-green)',
                  animation: i === 3 ? 'pulse-dot 1.5s infinite' : 'none',
                  flexShrink: 0
                }} />
                <span style={{ fontSize: '0.78rem', color: i === 3 ? '#a5b4fc' : 'var(--text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CUSTOM CHART TOOLTIP
───────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem'
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.unit || ''}</div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN HOMEPAGE COMPONENT
───────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const scrolled = useNavScroll();

  const metricsRef = useScrollReveal();
  const workflowRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const integrationsRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const securityRef = useScrollReveal();
  const chartsRef = useScrollReveal();
  const archRef = useScrollReveal();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = () => login();

  return (
    <>
      <div className="hp-bg" />

      {/* ── NAVBAR ── */}
      <nav className={`hp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="hp-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="/" className="hp-nav-brand">
              <Activity size={20} className="hp-nav-brand-icon" />
              DevPilot
            </a>
            <div className="hp-nav-status">
              <span className="hp-status-dot" />
              AI Engine Online
            </div>
          </div>

          <ul className="hp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#preview">Preview</a></li>
            <li><a href="#security">Security</a></li>
          </ul>

          <div className="hp-nav-actions">
            <button className="hp-btn-primary" onClick={handleLogin}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-glow" />
        <div className="hp-hero-badge">
          <Zap size={12} /> Autonomous DevOps Agent
        </div>
        <h1 className="hp-hero-title">Your AI Engineer for Every GitHub Repository.</h1>
        <p className="hp-hero-sub">
          Find bugs. Fix code. Run tests. Ship with confidence. An autonomous agent that takes your repository from failure to a production-ready pull request.
        </p>
        <div className="hp-hero-ctas">
          <button className="hp-hero-cta-primary" onClick={handleLogin}>
            <GithubSvg size={18} />
            Connect GitHub
            <ArrowRight size={16} />
          </button>
          <a href="#how-it-works" className="hp-hero-cta-secondary">
            See how it works <ChevronRight size={14} />
          </a>
        </div>
        <div className="hp-hero-trust">
          Works with GitHub · GitHub Actions · Docker · Node.js · TypeScript · Python · Java
        </div>
        <AgentVisualization />
      </section>

      {/* ── TERMINAL DEMO ── */}
      <section className="hp-section" id="how-it-works">
        <div className="hp-container" style={{ textAlign: 'center' }}>
          <div className="hp-section-tag">Live Demo</div>
          <h2 className="hp-section-title">Watch the Agent Work</h2>
          <p className="hp-section-subtitle" style={{ margin: '0 auto 52px' }}>
            The agent runs autonomously inside an isolated Docker environment — no manual steps required.
          </p>
          <TerminalDemo />
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div ref={workflowRef} className="hp-reveal">
            <div className="hp-section-tag">From Bug to Pull Request</div>
            <h2 className="hp-section-title" style={{ marginBottom: 40 }}>Five Steps. Fully Automated.</h2>
            <div className="hp-workflow-steps">
              {[
                { num: '01', icon: <GithubSvg size={18} />, title: 'Connect', desc: 'Link your GitHub account. Select any repository in seconds.' },
                { num: '02', icon: <Search size={18} />, title: 'Analyze', desc: 'AI maps your codebase, tests, logs and dependencies.' },
                { num: '03', icon: <Bug size={18} />, title: 'Diagnose', desc: 'The agent pinpoints the root cause of every failure.' },
                { num: '04', icon: <Code2 size={18} />, title: 'Fix', desc: 'Generates a targeted patch and validates it locally.' },
                { num: '05', icon: <GitPullRequest size={18} />, title: 'Ship', desc: 'Creates a branch, commits, pushes and monitors CI/CD.' },
              ].map((step, i) => (
                <div key={i} className="hp-workflow-step">
                  <div className="hp-workflow-num">{step.num}</div>
                  <div className="hp-workflow-icon">{step.icon}</div>
                  <div className="hp-workflow-title">{step.title}</div>
                  <div className="hp-workflow-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="hp-section" id="preview" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Product Preview</div>
          <h2 className="hp-section-title" style={{ marginBottom: 12 }}>A Dashboard Built for Engineers</h2>
          <p className="hp-section-subtitle" style={{ marginBottom: 48 }}>
            Every detail of the autonomous workflow is visible, inspectable, and controllable.
          </p>
          <DashboardPreview />
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div ref={metricsRef} className="hp-reveal hp-metrics-grid">
            {[
              { val: 99.2, suffix: '%', label: 'CI validation success rate' },
              { val: 4.8, suffix: '×', label: 'Faster than manual debugging' },
              { val: 327, suffix: '+', label: 'Tests analyzed per repository' },
              { val: 24, suffix: '/7', label: 'Autonomous monitoring' },
            ].map((m, i) => (
              <div key={i} className="hp-metric-card">
                <div className="hp-metric-val">
                  <Counter target={m.val} suffix={m.suffix} />
                </div>
                <div className="hp-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 14, fontFamily: 'var(--font-mono)' }}>
            * Demo metrics for illustration purposes
          </p>
        </div>
      </section>

      {/* ── CHARTS ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Analytics</div>
          <h2 className="hp-section-title" style={{ marginBottom: 12 }}>Watch Your Engineering Workflow Improve</h2>
          <p className="hp-section-subtitle" style={{ marginBottom: 48 }}>
            Mock data — illustrative of typical improvement patterns.
          </p>
          <div ref={chartsRef} className="hp-reveal hp-charts-grid">
            {/* Build Success Rate */}
            <div className="hp-chart-card">
              <div className="hp-chart-card-title">Build Success Rate</div>
              <div className="hp-chart-card-sub">Before vs After AI Agent (mock data)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={buildData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="run" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="before" name="Before" stroke="#475569" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="after" name="After" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="hp-chart-legend">
                <div className="hp-chart-legend-item"><span className="hp-chart-legend-dot" style={{ background: '#475569' }} /> Before</div>
                <div className="hp-chart-legend-item"><span className="hp-chart-legend-dot" style={{ background: '#4f46e5' }} /> After AI Agent</div>
              </div>
            </div>

            {/* Failure Resolution */}
            <div className="hp-chart-card">
              <div className="hp-chart-card-title">Avg. Failure Resolution Time</div>
              <div className="hp-chart-card-sub">Hours per incident (mock data)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={resolutionData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="method" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} unit="h" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="hours" name="Hours" fill="#4f46e5" radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fill: '#94a3b8', fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="hp-section" id="features" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Features</div>
          <h2 className="hp-section-title" style={{ marginBottom: 12 }}>An Autonomous Engineering Loop</h2>
          <p className="hp-section-subtitle" style={{ marginBottom: 48 }}>
            Every piece of the DevOps workflow, handled by one intelligent agent.
          </p>
          <div ref={featuresRef} className="hp-reveal hp-features-grid">
            {[
              { icon: <Bug size={18} />, title: 'Autonomous Debugging', desc: 'Understands stack traces, logs and source code to pinpoint failures without human input.' },
              { icon: <TestTube size={18} />, title: 'Intelligent Test Discovery', desc: 'Automatically discovers and executes the appropriate test suite for any project.' },
              { icon: <Code2 size={18} />, title: 'AI Code Fixes', desc: 'Generates targeted, minimal patches instead of blindly modifying files.' },
              { icon: <GitBranch size={18} />, title: 'GitHub Integration', desc: 'Creates branches, commits changes with [AI-AGENT] prefix, and opens PRs automatically.' },
              { icon: <Activity size={18} />, title: 'CI/CD Monitoring', desc: 'Continuously watches pipeline results and reacts to failures in real time.' },
              { icon: <RefreshCw size={18} />, title: 'Self-Correcting Agent', desc: 'If the first fix fails, the agent analyzes the new failure and intelligently retries.' },
            ].map((f, i) => (
              <div key={i} className="hp-feature-card">
                <div className="hp-feature-icon">{f.icon}</div>
                <div className="hp-feature-title">{f.title}</div>
                <div className="hp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container" style={{ textAlign: 'center' }}>
          <div className="hp-section-tag">Integrations</div>
          <h2 className="hp-section-title" style={{ marginBottom: 12 }}>Built for Real Engineering Stacks</h2>
          <p className="hp-section-subtitle" style={{ margin: '0 auto 48px' }}>
            Works with the tools your team already uses.
          </p>
          <div ref={integrationsRef} className="hp-reveal hp-integrations-grid">
            {['GitHub', 'GitHub Actions', 'Docker', 'Node.js', 'Python', 'Java', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Redis', 'LangGraph'].map((t, i) => (
              <div key={i} className="hp-integration-chip">
                <Layers size={14} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Architecture</div>
          <h2 className="hp-section-title" style={{ marginBottom: 12 }}>One Agent. Your Entire Development Loop.</h2>
          <p className="hp-section-subtitle" style={{ marginBottom: 48 }}>
            A clean, inspectable system that you stay in control of at every step.
          </p>
          <div ref={archRef} className="hp-reveal hp-arch-diagram">
            <div className="hp-arch-row">
              <div className="hp-arch-node"><GithubSvg size={14} /> GitHub</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row">
              <div className="hp-arch-node primary">DevPilot API</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row">
              <div className="hp-arch-node primary">Agent Engine</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row" style={{ gap: 32 }}>
              <div className="hp-arch-node">Analyze</div>
              <div className="hp-arch-arrow">—</div>
              <div className="hp-arch-node">Test</div>
              <div className="hp-arch-arrow">—</div>
              <div className="hp-arch-node">Debug</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row">
              <div className="hp-arch-node primary">AI Fix Loop</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row">
              <div className="hp-arch-node">CI/CD Pipeline</div>
            </div>
            <div className="hp-arch-connector" />
            <div className="hp-arch-row">
              <div className="hp-arch-node success-node">✓ PASS — PR Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Testimonials</div>
          <h2 className="hp-section-title" style={{ marginBottom: 48 }}>Engineers Love It</h2>
          <div ref={testimonialsRef} className="hp-reveal hp-testimonials-grid">
            {[
              { quote: 'Instead of spending an hour tracing a failing test, we let the agent investigate it while we focused on the feature.', name: 'A.K.', role: 'Senior Software Engineer', initials: 'AK' },
              { quote: 'The PR-based workflow makes the AI feel like another engineer on the team rather than just another chatbot.', name: 'R.M.', role: 'Engineering Lead', initials: 'RM' },
              { quote: "It doesn't just generate code. It validates the change through the actual CI pipeline before opening a PR.", name: 'S.P.', role: 'Platform Engineer', initials: 'SP' },
            ].map((t, i) => (
              <div key={i} className="hp-testimonial-card">
                <p className="hp-testimonial-quote">{t.quote}</p>
                <div className="hp-testimonial-author">
                  <div className="hp-testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="hp-testimonial-name">{t.name}</div>
                    <div className="hp-testimonial-role">{t.role} — placeholder testimonial</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="hp-section" id="security" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-section-tag">Security</div>
          <h2 className="hp-section-title" style={{ marginBottom: 48 }}>Your Code Stays Under Your Control</h2>
          <div ref={securityRef} className="hp-reveal hp-security-grid">
            <div className="hp-security-list">
              {[
                { title: 'OAuth Authentication', desc: 'Secure GitHub OAuth with scoped permissions only.' },
                { title: 'Repository-Level Access', desc: 'Grant access per-repository, not your entire account.' },
                { title: 'Secure Token Handling', desc: 'Tokens stored encrypted, never logged or exposed.' },
                { title: 'Isolated Docker Execution', desc: 'All agent work runs inside ephemeral Docker containers.' },
                { title: 'Branch-Based Changes', desc: 'Agent never modifies main/production branches directly.' },
                { title: 'Full Audit Logs', desc: 'Every action the agent takes is logged and inspectable.' },
              ].map((s, i) => (
                <div key={i} className="hp-security-item">
                  <CheckCircle2 size={16} className="hp-security-item-icon" />
                  <div className="hp-security-item-text">
                    <strong>{s.title}</strong>
                    <span>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hp-security-visual">
              <div className="hp-shield">
                <div className="hp-shield-bg" />
                <Shield size={64} className="hp-shield-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="hp-cta-section">
        <div className="hp-bg" style={{ opacity: 0.6 }} />
        <div className="hp-cta-glow" />
        <div className="hp-container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="hp-cta-title">Stop debugging.<br />Start shipping.</h2>
          <p className="hp-cta-sub">Give your repository an autonomous engineering loop.</p>
          <div className="hp-cta-btns">
            <button className="hp-cta-primary" onClick={handleLogin}>
              <GithubSvg size={18} />
              Connect GitHub
              <ArrowRight size={16} />
            </button>
            <a href="#how-it-works" className="hp-btn-secondary">Explore the architecture</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer-grid">
            <div>
              <div className="hp-footer-brand-name">
                <Activity size={18} />
                DevPilot
              </div>
              <p className="hp-footer-tagline">An autonomous DevOps agent that diagnoses failures, generates fixes, and ships production-ready pull requests.</p>
            </div>
            <div>
              <div className="hp-footer-col-title">Product</div>
              <div className="hp-footer-links">
                <a href="#">Features</a>
                <a href="#">How it works</a>
                <a href="#">Pricing</a>
                <a href="#">Changelog</a>
              </div>
            </div>
            <div>
              <div className="hp-footer-col-title">Developers</div>
              <div className="hp-footer-links">
                <a href="#">Documentation</a>
                <a href="#">GitHub</a>
                <a href="#">API</a>
                <a href="#">Architecture</a>
              </div>
            </div>
            <div>
              <div className="hp-footer-col-title">Company</div>
              <div className="hp-footer-links">
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#security">Security</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2026 DevPilot. Built for developers.</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>v0.1.0-alpha</span>
          </div>
        </div>
      </footer>
    </>
  );
}
