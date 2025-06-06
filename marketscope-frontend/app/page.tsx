"use client";
import React, { useState, useEffect } from "react";
const AllInOneHome: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [query, setQuery] = useState("");
  const [exampleQueries, setExampleQueries] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setExampleQueries([
      "Dissect Apple’s generative-AI hiring velocity in Q2 2025",
      "Contrast OpenAI & Anthropic’s patent filings last 18 months",
      "Surface regulatory risk signals for crypto-custody startups",
      "Map NVIDIA’s supply-chain sentiment week-over-week",
    ]);
  }, []);

  const Icon: React.FC<{ path: string; size?: number; className?: string }> = ({
    path,
    size = 24,
    className,
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );

  const ICONS = {
    logo:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z",
    webMonitor:
      "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM11 17h2v-2h-2v2zm0-4h2V7h-2v6z",
    trendAnalyzer:
      "M3 17h2v-4h4v4h2V9h-2v4H5V9H3v8zm13-8h-2l4-4 4 4h-2v8h-4V9z",
    summaryAgent:
      "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 18H6V4h8v4h4v12z",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

        :root {
          --bg-dark: #010409;
          --accent: #00ffff;
          --text-light: #e6edf3;
          --text-muted: #8b949e;
          --input-bg: #1a1f2e;
          --border-soft: rgba(255, 255, 255, 0.08);
        }
        body {
          margin: 0;
          background: var(--bg-dark);
          color: var(--text-light);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }
        /* Intro */
        .intro { /* …same as before…*/ }
        .intro .sweep { /* … */ }
        .intro .pulse { /* … */ }
        .intro h1 { /* … */ }

        /* Page container */
        .page { display: flex; flex-direction: column; min-height: 100vh; }

        /* Header */
        header {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: rgba(1,4,9,0.85);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid #21262d;
          z-index: 50;
        }
        .logo-group { display: flex; align-items: center; gap: 8px; }
        .logo-text {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--accent);
        }
        nav a {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-left: 24px;
          position: relative;
          transition: color 0.2s;
        }
        nav a::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--accent);
          transition: width 0.3s;
        }
        nav a:hover { color: var(--text-light); }
        nav a:hover::after { width: 100%; }

        /* Hero (full viewport) */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 100vh;
          background: radial-gradient(circle at top, #031b1d, var(--bg-dark));
          padding: 0 24px;
        }
        .hero h2 {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 3.4rem; /* slightly larger */
          font-weight: 600;
          color: var(--text-light);
          margin: 0;
          line-height: 1.1;
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.4s forwards;
        }
        .hero p {
          max-width: 40rem;
          margin-top: 20px;
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.6;
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.7s forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Value-Proposition Strip */
        .hero-values {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          opacity: 0;
          animation: fadeInUp 1s ease-out 1s forwards;
        }
        .value-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--input-bg);
          border: 1px solid var(--border-soft);
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: var(--text-light);
          transition: background 0.2s, transform 0.1s;
        }
        .value-item:hover {
          background: rgba(26, 31, 46, 0.9);
          transform: translateY(-2px);
        }

        /* Search & Examples */
        .search-full {
          margin-top: 40px;
          width: 100%;
          max-width: 50rem;
          position: relative;
          opacity: 0;
          animation: fadeInUp 1s ease-out 1.3s forwards;
        }
        .search-full input {
          width: 100%;
          padding: 18px 20px;
          border-radius: 6px;
          background: var(--input-bg);
          border: 1px solid #30363d;
          color: var(--text-light);
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          transition: border 0.3s, box-shadow 0.3s;
          text-align: left;
        }
        .search-full input::placeholder {
          color: var(--text-muted);
          font-style: italic;
        }
        .search-full input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
          outline: none;
        }

        .examples {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
          justify-content: center;
          opacity: 0;
          animation: fadeInUp 1s ease-out 1.5s forwards;
        }
        .examples button {
          background: transparent;
          border: 1px solid var(--border-soft);
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.9rem;
          color: var(--text-light);
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .examples button:hover {
          background: var(--input-bg);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Intro animation */}
      {showIntro && (
        <div className="intro">
          <div className="sweep" />
          <div className="pulse" />
          <h1>MarketScope</h1>
        </div>
      )}

      <div className="page">
        {/* Header */}
        <header>
          <div className="logo-group">
            <Icon path={ICONS.logo} size={28} className="text-[var(--accent)]" />
            <span className="logo-text">MarketScope</span>
          </div>
          <nav>
            <a href="#agents">Agents</a>
            <a href="#stack">Stack & Use Cases</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        {/* Hero (full viewport) */}
        <section className="hero">
          <h2>Clarity Amid Market Chaos</h2>
          <p>
            MarketScope fuses AI-driven agents with live data feeds to transform raw signals into
            strategic insights—delivered instantly, so you can outpace competitors.
          </p>

          {/* Value-Proposition Strip */}
          <div className="hero-values">
            <div className="value-item">
              <Icon path={ICONS.webMonitor} size={20} className="text-[var(--accent)]" />
              <span>Real-Time Monitoring</span>
            </div>
            <div className="value-item">
              <Icon path={ICONS.trendAnalyzer} size={20} className="text-[var(--accent)]" />
              <span>Trend Analysis</span>
            </div>
            <div className="value-item">
              <Icon path={ICONS.summaryAgent} size={20} className="text-[var(--accent)]" />
              <span>Automated Summaries</span>
            </div>
          </div>

          {/* Full-Width Search Input */}
          <div className="search-full">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Draft a directive…"
              />
            </form>
          </div>

          {/* Example Queries */}
          <div className="examples">
            {exampleQueries.map((q) => (
              <button key={q} onClick={() => setQuery(q)}>
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="alt">
          {/* …existing Agents content… */}
        </section>

        {/* Stack & Use Cases Section */}
        <section id="stack">
          {/* …existing Stack & Use Cases content… */}
        </section>

        {/* Footer */}
        <footer id="contact">
          {/* …existing Footer content… */}
        </footer>
      </div>
    </>
  );
};

export default AllInOneHome;
