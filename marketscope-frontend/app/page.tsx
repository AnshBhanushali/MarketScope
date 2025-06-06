"use client";
import React, { useState, useEffect } from "react";

/**
 * MarketScope – Landing page with a full-width search input (no card),
 * styled for a serious business audience. The hero section fills the viewport.
 */
const AllInOneHome: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [query, setQuery] = useState("");
  const [exampleQueries, setExampleQueries] = useState<string[]>([]);

  // Hide intro overlay after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Populate example queries
  useEffect(() => {
    setExampleQueries([
      "Dissect Apple’s generative-AI hiring velocity in Q2 2025",
      "Contrast OpenAI & Anthropic’s patent filings last 18 months",
      "Surface regulatory risk signals for crypto-custody startups",
      "Map NVIDIA’s supply-chain sentiment week-over-week",
    ]);
  }, []);

  // SVG helper
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
    twitter:
      "M22.46 6c-.77.35-1.6.59-2.46.69A4.23 4.23 0 0 0 21.86 4c-.83.49-1.76.85-2.74 1.05A4.18 4.18 0 0 0 15.5 4c-2.34 0-4.23 1.9-4.23 4.22 0 .33.04.66.11.97C7.69 8.97 4.07 7.13 1.64 4.15a4.24 4.24 0 0 0-.57 2.12c0 1.46.75 2.75 1.9 3.5a4.2 4.2 0 0 1-1.92-.53v.05c0 2.04 1.45 3.75 3.36 4.13a4.32 4.32 0 0 1-1.9.07 4.24 4.24 0 0 0 3.94 2.93A8.4 8.4 0 0 1 1 18.58a11.86 11.86 0 0 0 6.41 1.88c7.68 0 11.88-6.36 11.88-11.9 0-.18-.01-.35-.02-.53A8.64 8.64 0 0 0 22.46 6z",
    github:
      "M12 0.5C5.73 0.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.55 0-.27-.01-1.15-.02-2.09-3.1.67-3.76-1.49-3.76-1.49-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.17-2.99-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.14a10.9 10.9 0 0 1 2.87-.39c.97.01 1.95.13 2.87.39 2.19-1.45 3.15-1.14 3.15-1.14.62 1.57.23 2.73.11 3.02.73.78 1.17 1.77 1.17 2.99 0 4.29-2.61 5.23-5.1 5.5.43.37.81 1.1.81 2.21 0 1.6-.02 2.89-.02 3.29 0 .3.21.67.8.55A11.52 11.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5z",
  } as const;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

    :root {
      --bg-dark: #010409;
      --bg-section: #0b111b;
      --input-bg: #1a1f2e;
      --accent: #00ffff;
      --text-light: #e6edf3;
      --text-muted: #8b949e;
      --border-soft: rgba(255, 255, 255, 0.08);
    }

    body {
      margin: 0;
      background: var(--bg-dark);
      color: var(--text-light);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    /* Intro overlay */
    .intro {
      position: fixed;
      inset: 0;
      background: var(--bg-dark);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .intro .sweep {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 200vmax;
      height: 200vmax;
      margin-top: -100vmax;
      margin-left: -100vmax;
      background-image: conic-gradient(
        from 0deg at 50% 50%,
        var(--bg-dark) 0% 80%,
        rgba(0, 255, 255, 0.3) 92%,
        #fff 100%
      );
      animation: rotateConic 5s linear infinite;
    }
    @keyframes rotateConic {
      100% { transform: rotate(360deg); }
    }
    .intro .pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 110vmax;
      height: 110vmax;
      margin-top: -55vmax;
      margin-left: -55vmax;
      border: 2px solid rgba(0, 255, 255, 0.4);
      border-radius: 50%;
      animation: pulseAnim 2s ease-out infinite;
    }
    @keyframes pulseAnim {
      0% { opacity: 0; transform: scale(0.4); }
      50% { opacity: 0.3; }
      100% { opacity: 0; transform: scale(1); }
    }
    .intro h1 {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 2.6rem;
      font-weight: 700;
      color: var(--accent);
      text-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
      opacity: 0;
      animation: fadeInText 1.2s ease-out 0.8s forwards;
    }
    @keyframes fadeInText {
      from { opacity: 0; filter: blur(6px); }
      to { opacity: 1; filter: blur(0); }
    }

    /* Page container */
    .page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Header */
    header {
      position: sticky;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      background: rgba(1, 4, 9, 0.85);
      backdrop-filter: blur(6px);
      border-bottom: 1px solid #21262d;
      z-index: 50;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-text {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--accent);
    }
    nav a {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: var(--text-muted);
      text-decoration: none;
      margin-left: 24px;
      position: relative;
      transition: color 0.2s ease;
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
    nav a:hover {
      color: var(--text-light);
    }
    nav a:hover::after {
      width: 100%;
    }

    /* Hero (full viewport) */
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 100vh;
      background: radial-gradient(circle at top, #031b1d, var(--bg-dark));
    }
    .hero h2 {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 3.2rem;
      font-weight: 700;
      color: var(--text-light);
      margin: 0;
      opacity: 0;
      animation: fadeInUp 1s ease-out 0.5s forwards;
    }
    .hero p {
      max-width: 36rem;
      margin-top: 16px;
      font-size: 1rem;
      color: var(--text-muted);
      line-height: 1.6;
      opacity: 0;
      animation: fadeInUp 1s ease-out 0.8s forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Full-Width Search Input */
    .search-full {
      margin-top: 32px;
      width: 100%;
      max-width: 48rem;
      position: relative;
      opacity: 0;
      animation: fadeInUp 1s ease-out 1s forwards;
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

    /* Example Queries (below input) */
    .examples {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 18px;
      justify-content: center;
      opacity: 0;
      animation: fadeInUp 1s ease-out 1.2s forwards;
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

    /* Section wrapper */
    section[id] {
      padding: 96px 24px;
    }
    section.alt {
      background: var(--bg-section);
    }
    .section-title {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 2.2rem;
      font-weight: 600;
      color: #c9d1d9;
      text-align: center;
      margin: 0 0 16px;
    }
    .section-subtitle {
      max-width: 40rem;
      margin: 0 auto 56px;
      font-size: 1rem;
      color: var(--text-muted);
      line-height: 1.6;
      text-align: center;
    }

    /* Grid cards (retained for later sections) */
    .grid {
      display: grid;
      gap: 28px;
      max-width: 1000px;
      margin: 0 auto;
    }
    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .card {
      background: var(--input-bg);
      border: 1px solid var(--border-soft);
      border-radius: 10px;
      padding: 24px;
      backdrop-filter: blur(10px);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .card h3 {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--accent);
    }
    .card p {
      font-size: 0.95rem;
      color: #c9d1d9;
      line-height: 1.5;
    }

    /* Footer */
    footer {
      background: var(--bg-dark);
      border-top: 1px solid #21262d;
      padding: 56px 24px;
      text-align: center;
    }
    .footer-logo {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--accent);
      margin: 0 0 10px;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin-bottom: 12px;
    }
    .footer-links a {
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: #fff;
    }
    .footer-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }
  `;

  return (
    <>
      <style>{styles}</style>

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
            <a href="#workflow">Workflow</a>
            <a href="#edge">Edge</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        {/* Hero (full viewport) */}
        <section className="hero">
          <h2>Clarity Amid Market Chaos</h2>
          <p>
            MarketScope fuses AI-driven agents with live data feeds to transform raw signals into
            strategic insights—delivered instantly, so you can outpace your competition.
          </p>

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

        {/* Workflow */}
        <section id="workflow" className="alt">
          <h3 className="section-title">Workflow Engine</h3>
          <p className="section-subtitle">
            Each directive triggers a three-phase pipeline orchestrated by CrewAI agents and vectored memory.
          </p>
          <div className="grid">
            <div className="card">
              <h3>1 ▸ Define Objective</h3>
              <p>
                Articulate your research question—market sizing, competitive intel, or regulatory risk—then specify
                filters like geography and timeframe.
              </p>
            </div>
            <div className="card">
              <h3>2 ▸ Autonomous Recon</h3>
              <p>
                Specialist agents scour financial filings, newswires, patent databases, social chatter, and more,
                enriching findings through RAG-powered reasoning.
              </p>
            </div>
            <div className="card">
              <h3>3 ▸ Executive Brief</h3>
              <p>
                A structured dossier appears on your dashboard, complete with bullet-grade insights, risk radar,
                KPI pulse, and traceable citations.
              </p>
            </div>
          </div>
        </section>

        {/* Edge */}
        <section id="edge">
          <h3 className="section-title">Why MarketScope?</h3>
          <p className="section-subtitle">
            Built for strategy teams that need actionable intelligence—now, not next quarter.
          </p>
          <div className="grid">
            <div className="card">
              <h3>Real-time Vector Core</h3>
              <p>
                Incoming data is vector-indexed within 400 ms, ensuring agents have instant recall of the freshest
                intelligence.
              </p>
            </div>
            <div className="card">
              <h3>Hybrid LLM Mesh</h3>
              <p>
                OpenAI GPT-4o, Gemini, and Claude co-reason—auto-routed according to token cost, latency, and
                subject expertise.
              </p>
            </div>
            <div className="card">
              <h3>Enterprise-grade Security</h3>
              <p>
                Zero data retention, SOC 2 alignment, and on-prem deployment keep your proprietary strategies
                compartmentalized and secure.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact">
          <div className="footer-logo">MarketScope</div>
          <div className="footer-links">
            <a href="https://twitter.com" aria-label="Twitter">
              <Icon path={ICONS.twitter} size={20} />
            </a>
            <a href="https://github.com" aria-label="GitHub">
              <Icon path={ICONS.github} size={20} />
            </a>
          </div>
          <p className="footer-text">© {new Date().getFullYear()} MarketScope Inc. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default AllInOneHome;
