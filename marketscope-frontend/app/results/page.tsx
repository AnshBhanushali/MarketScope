// app/results/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ResultsPage: React.FC = () => {
  const params = useSearchParams();
  const directive = params.get("directive") || "";
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<{
    web_monitor: string[];
    trend_analyzer: string[];
    summary_agent: string[];
  }>({
    web_monitor: [],
    trend_analyzer: [],
    summary_agent: [],
  });
  const [activeTab, setActiveTab] = useState<"web" | "trend" | "summary">("web");

  useEffect(() => {
    if (!directive) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace the URL below with wherever your FastAPI is running
        const res = await fetch("http://127.0.0.1:8000/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directive }),
        });
        const json = await res.json();
        // Expecting { web_monitor: [...], trend_analyzer: [...], summary_agent: [...] }
        setAgentData({
          web_monitor: json.web_monitor || [],
          trend_analyzer: json.trend_analyzer || [],
          summary_agent: json.summary_agent || [],
        });
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [directive]);

  // If there's no directive, redirect back or show a message
  if (!directive) {
    return (
      <div
        style={{
          height: "100vh",
          background: "var(--bg-dark)",
          color: "var(--text-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <p>No directive provided. <a href="/" style={{ color: "var(--accent)" }}>Go back</a>.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --bg-dark: #010409;
          --accent: #00ffff;
          --text-light: #e6edf3;
          --text-muted: #8b949e;
          --section-bg: #0d1117;
        }
        body, html {
          margin: 0;
          padding: 0;
          background: var(--bg-dark);
          color: var(--text-light);
          font-family: 'Inter', sans-serif;
        }
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          position: sticky;
          top: 0;
          background: var(--bg-dark);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #21262d;
          z-index: 10;
        }
        .logo-text {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent);
        }
        nav a {
          color: var(--text-muted);
          margin-left: 24px;
          font-size: 0.9rem;
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }
        nav a:hover {
          color: var(--text-light);
        }

        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 24px;
          box-sizing: border-box;
        }

        /* Loading spinner container */
        .spinner-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 64px;
          height: 64px;
          border: 6px solid rgba(255, 255, 255, 0.1);
          border-top: 6px solid var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Tab header circles */
        .tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
        }
        .tab-button {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--section-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          border: 2px solid transparent;
        }
        .tab-button:hover {
          transform: translateY(-4px);
        }
        .tab-button.active {
          border-color: var(--accent);
          background: rgba(0, 255, 255, 0.1);
        }
        .tab-button span {
          font-family: 'IBM Plex Sans', sans-serif;
          text-align: center;
          color: var(--text-light);
          font-size: 0.95rem;
          pointer-events: none;
        }

        /* Content area */
        .tab-content {
          max-width: 800px;
          width: 100%;
          background: var(--section-bg);
          padding: 24px;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .bullet-list {
          list-style: disc inside;
          color: #c9d1d9;
          line-height: 1.6;
        }
        .bullet-item {
          margin-bottom: 12px;
        }
      `}</style>

      <div className="container">
        <header>
          <div className="logo-text">MarketScope</div>
          <nav>
            <a href="/">← New Search</a>
          </nav>
        </header>

        <main>
          {loading ? (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Tab headers */}
              <div className="tabs">
                <div
                  className={`tab-button ${activeTab === "web" ? "active" : ""}`}
                  onClick={() => setActiveTab("web")}
                >
                  <span>Web Monitor</span>
                </div>
                <div
                  className={`tab-button ${activeTab === "trend" ? "active" : ""}`}
                  onClick={() => setActiveTab("trend")}
                >
                  <span>Trend Analyzer</span>
                </div>
                <div
                  className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
                  onClick={() => setActiveTab("summary")}
                >
                  <span>Summary Agent</span>
                </div>
              </div>

              {/* Tab content */}
              <div className="tab-content">
                {activeTab === "web" && (
                  <ul className="bullet-list">
                    {agentData.web_monitor.map((bullet, i) => (
                      <li key={i} className="bullet-item">
                        {bullet}
                      </li>
                    ))}
                    {agentData.web_monitor.length === 0 && (
                      <li className="bullet-item">No WebMonitor results found.</li>
                    )}
                  </ul>
                )}

                {activeTab === "trend" && (
                  <ul className="bullet-list">
                    {agentData.trend_analyzer.map((bullet, i) => (
                      <li key={i} className="bullet-item">
                        {bullet}
                      </li>
                    ))}
                    {agentData.trend_analyzer.length === 0 && (
                      <li className="bullet-item">No TrendAnalyzer results found.</li>
                    )}
                  </ul>
                )}

                {activeTab === "summary" && (
                  <ul className="bullet-list">
                    {agentData.summary_agent.map((bullet, i) => (
                      <li key={i} className="bullet-item">
                        {bullet}
                      </li>
                    ))}
                    {agentData.summary_agent.length === 0 && (
                      <li className="bullet-item">No SummaryAgent results found.</li>
                    )}
                  </ul>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default ResultsPage;
