// app/results/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

//------------------------------------------------------------
// Types that mirror FastAPI response
//------------------------------------------------------------
interface WebArticle {
  title: string;
  url: string;
  summary?: string;
  image: string;
}

interface TrendDataPoint {
  label: string;
  value: string;
  description?: string;
}

interface ApiResult {
  directive: string;
  web_monitor: WebArticle[];    // now an array of objects
  trend_analyzer: TrendDataPoint[];
  summary_agent: string;        // a paragraph summary
}

//------------------------------------------------------------
// Main Component
//------------------------------------------------------------
export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const directive = searchParams.get("directive") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<ApiResult | null>(null);

  // Kick off fetch once we have a directive.
  useEffect(() => {
    if (!directive) return;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://127.0.0.1:8000/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directive }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResult = await res.json();
        setData(json);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [directive]);

  // Guard: if someone lands on /results without param → go home
  useEffect(() => {
    if (!directive) router.push("/");
  }, [directive, router]);

  //--------------- RENDER STATES ---------------------------
  if (!directive) return null;

  if (loading)
    return (
      <PageShell>
        <div className="flex flex-col items-center py-24">
          <div className="spinner" />
          <h2 className="mt-4">Gathering intelligence for “{directive}” …</h2>
        </div>
        <style jsx>{`
          .spinner {
            width: 56px;
            height: 56px;
            border: 6px solid rgba(0, 255, 255, 0.25);
            border-top: 6px solid #00ffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </PageShell>
    );

  if (error)
    return (
      <PageShell>
        <div className="text-center py-20">
          <h2 className="text-xl mb-4">Error while fetching results</h2>
          <p className="text-rose-400 mb-6">{error}</p>
          <button className="back-btn" onClick={() => router.push("/")}>
            ⟵ Back
          </button>
        </div>
        <style jsx>{`
          .back-btn {
            background: #00ffff;
            color: #010409;
            padding: 0.5rem 1.25rem;
            font-weight: 600;
            border-radius: 4px;
            border: none;
            cursor: pointer;
          }
          .back-btn:hover {
            background: #10e1ea;
          }
        `}</style>
      </PageShell>
    );

  // ─────────────── Guard against data === null ───────────────
  if (!data) {
    // (Should only briefly happen between loading → data arrival.)
    return null;
  }

  //--------------------------------------------------------
  // Normal Render (now that `data` is guaranteed non-null)
  //--------------------------------------------------------
  const webItems = data.web_monitor; 
  const googleNews = `https://news.google.com/search?q=${encodeURIComponent(
    directive
  )}`;
  const wikiSearch = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
    directive
  )}`;

  return (
    <PageShell>
      {/* HERO */}
      <section className="hero">
        <h1 className="hero-h1">MarketScope Results</h1>
        <p className="hero-sub">“{directive}”</p>
        <div className="hero-links">
          <a href={googleNews} target="_blank" rel="noopener noreferrer">
            Google News ↗
          </a>
          <span>•</span>
          <a href={wikiSearch} target="_blank" rel="noopener noreferrer">
            Wikipedia Search ↗
          </a>
        </div>
      </section>

      {/* WEB MONITOR */}
      <Section title="Web Monitor" subtitle="Latest headlines (live RSS scrape)">
        <div className="grid cards-3">
          {webItems.map((w, i) => (
            <a
              key={i}
              href={w.url || googleNews}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link"
            >
              <div className="card-img">
                <img src={w.image} alt={`Thumbnail for ${w.title}`} />
              </div>
              <div className="card-body">
                <h3>{w.title}</h3>
                {w.summary && (
                  <p className="summary-lines">
                    {w.summary.length > 100
                      ? w.summary.slice(0, 100) + "…"
                      : w.summary}
                  </p>
                )}
                {w.url && (
                  <p className="url">
                    {new URL(w.url).hostname.replace("www.", "")}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* TREND ANALYZER */}
      <Section title="Trend Analyzer" subtitle="Spikes, notable sentiment & volumes">
        <div className="grid cards-2">
          {data.trend_analyzer.map((line, i) => (
            <div key={i} className="trend-card">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="#00ffff"
                viewBox="0 0 24 24"
              >
                <path d="M3 17h2v-7H3v7zm4 0h2v-4H7v4zm4 0h2v-10h-2v10zm4 0h2v-6h-2v6zm4 0h2v-3h-2v3z" />
              </svg>
              <div className="trend-body">
                <h4 className="trend-label">{line.label}</h4>
                <p className="trend-value">{line.value}</p>
                {line.description && (
                  <p className="trend-desc">{line.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SUMMARY AGENT */}
      <Section
        title="AI Summary"
        subtitle="Actionable one‐paragraph intelligence you can paste into a deck"
      >
        <div className="summary-paragraph">{data.summary_agent}</div>
      </Section>

      {/* FOOTER / GO BACK */}
      <div className="py-8 text-center">
        <button className="back-btn" onClick={() => router.push("/")}>
          ⟵ Back to search
        </button>
      </div>

      {/* INLINE STYLES (styled-jsx) */}
      <style jsx>{`
        :global(body) {
          background: #010409;
          color: #e6edf3;
          font-family: "Inter", sans-serif;
        }

        /* Utility */
        .grid {
          display: grid;
          gap: 1.5rem;
        }
        .cards-3 {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        .cards-2 {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        /* HERO */
        .hero {
          text-align: center;
          padding: 2.5rem 1rem 3rem;
        }
        .hero-h1 {
          font-size: 2.2rem;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .hero-sub {
          color: #8b949e;
          margin-top: 0.25rem;
        }
        .hero-links {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          display: inline-flex;
          gap: 0.5rem;
        }
        .hero-links a {
          color: #00ffff;
          text-decoration: none;
        }
        .hero-links a:hover {
          text-decoration: underline;
        }

        /* Card (Web Monitor) */
        .card-link {
          display: flex;
          flex-direction: column;
          background: #1a1f2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .card-link:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.6);
        }
        .card-img img {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }
        .card-body {
          padding: 1rem;
        }
        .card-body h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          line-height: 1.4;
        }
        .card-body .summary-lines {
          font-size: 0.9rem;
          color: #c9d1d9;
          margin-bottom: 0.5rem;
        }
        .card-body .url {
          font-size: 0.8rem;
          color: #8b949e;
        }

        /* Trend card */
        .trend-card {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          background: #1a1f2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1rem;
        }
        .trend-body {
          display: flex;
          flex-direction: column;
        }
        .trend-label {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #00ffff;
        }
        .trend-value {
          margin: 0.25rem 0;
          font-size: 0.95rem;
          color: #e6edf3;
        }
        .trend-desc {
          font-size: 0.85rem;
          color: #8b949e;
          margin: 0;
        }

        /* Summary */
        .summary-paragraph {
          background: #1a1f2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #c9d1d9;
        }

        /* Buttons */
        .back-btn {
          background: transparent;
          color: #00ffff;
          border: 1px solid #00ffff;
          border-radius: 4px;
          padding: 0.5rem 1.25rem;
          font-weight: 600;
          cursor: pointer;
        }
        .back-btn:hover {
          background: #00ffff;
          color: #010409;
        }
      `}</style>
    </PageShell>
  );
}

//------------------------------------------------------------
// Small helper wrapper that includes the fixed header.
//------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-4 max-w-7xl w-full mx-auto">{children}</div>
    </main>
  );
}

//------------------------------------------------------------
// Header component reused from home page.
//------------------------------------------------------------
function SiteHeader() {
  const router = useRouter();
  return (
    <header className="site-header">
      <div className="logo-group" onClick={() => router.push("/")}>
        🔎
      </div>
      <nav>
        <a href="/">Home</a>
        <a href="#agents">Agents</a>
        <a href="#contact">Contact</a>
      </nav>
      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 32px;
          background: rgba(1, 4, 9, 0.9);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid #21262d;
        }
        .logo-group {
          font-weight: 700;
          font-size: 1.2rem;
          cursor: pointer;
        }
        nav a {
          margin-left: 24px;
          color: #8b949e;
          text-decoration: none;
          font-size: 0.9rem;
        }
        nav a:hover {
          color: #e6edf3;
        }
      `}</style>
    </header>
  );
}

//------------------------------------------------------------
// Reusable Section wrapper
//------------------------------------------------------------
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-10 pb-14">
      <div className="text-center mb-6">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>
      {children}
      <style jsx>{`
        .section-title {
          font-size: 1.65rem;
          color: #00ffff;
          margin: 0;
        }
        .section-sub {
          margin-top: 4px;
          color: #8b949e;
          font-size: 0.95rem;
        }
      `}</style>
    </section>
  );
}
