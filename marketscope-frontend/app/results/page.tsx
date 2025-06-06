"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

//------------------------------------------------------------
// FALLBACK‑FRIENDLY TYPES — we accept BOTH the simple string
// array shape (old backend) *and* the newer structured shape.
//------------------------------------------------------------
interface BulletShapeApi {
  directive: string;
  web_monitor: string[]; // "• [WebMonitor] Headline (Link: …)"
  trend_analyzer: string[]; // free‑form lines
  summary_agent: string[]; // bullet lines
}

interface StructuredArticle {
  title: string;
  url: string;
  thumbnail?: string | null;
}
interface StructuredTrend {
  interest_over_time: { [date: string]: number };
  current_interest: number;
  sentiment: number | null;
  trending_queries: string[];
}
interface StructuredApi {
  directive: string;
  web_monitor: { articles: StructuredArticle[] };
  trend_analyzer: StructuredTrend;
  summary_agent: { bullets: string[] };
}

type ApiResult = BulletShapeApi | StructuredApi;

//------------------------------------------------------------
// Utility helpers (work for both shapes)
//------------------------------------------------------------
function isStructured(api: ApiResult): api is StructuredApi {
  // Rough check: structured has object at web_monitor.articles
  return (
    typeof (api as any).web_monitor === "object" &&
    (api as any).web_monitor.articles !== undefined
  );
}

function parseBulletHeadline(bullet: string): StructuredArticle {
  const stripped = bullet.replace(/^•\s*\[WebMonitor\]\s*/, "").trim();
  const m = stripped.match(/^(.*)\s*\(Link:\s*(https?:\/\/[^)]+)\)$/);
  const title = m ? m[1].trim() : stripped;
  const url = m ? m[2].trim() : "";
  return { title, url };
}

function unsplashFor(title: string) {
  const words = title
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join(",");
  return `https://source.unsplash.com/480x300/?${encodeURIComponent(
    words || "finance,news"
  )}`;
}

//------------------------------------------------------------
// Sparkline component (unchanged)
//------------------------------------------------------------
type SparklinesProps = { data: number[]; width: number; height: number };
const Sparklines: React.FC<SparklinesProps> = ({ data, width, height }) => {
  if (!data.length) return <div style={{ color: "#8b949e" }}>No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / (max - min || 1)) * height,
  ]);
  const path = pts
    .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} stroke="#00ffff" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

//------------------------------------------------------------
// Header / Section / PageShell (same as before)
//------------------------------------------------------------
function SiteHeader() {
  const router = useRouter();
  return (
    <header className="site-header">
      <div className="logo" onClick={() => router.push("/")}>MarketScope</div>
      <nav>
        <a href="/">Home</a>
        <a href="#agents">Agents</a>
        <a href="#contact">Contact</a>
      </nav>
      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(1, 4, 9, 0.9);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid #21262d;
          z-index: 40;
        }
        .logo {
          font-weight: 700;
          font-size: 1.2rem;
          color: #00ffff;
          cursor: pointer;
        }
        nav a {
          margin-left: 1.5rem;
          color: #8b949e;
          text-decoration: none;
        }
        nav a:hover {
          color: #e6edf3;
        }
      `}</style>
    </header>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
          margin-top: 0.25rem;
          color: #8b949e;
          font-size: 0.95rem;
        }
      `}</style>
    </section>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-4 max-w-7xl w-full mx-auto">{children}</div>
    </main>
  );
}

//------------------------------------------------------------
// Main ResultsPage
//------------------------------------------------------------
export default function ResultsPage() {
  const search = useSearchParams();
  const router = useRouter();
  const directive = search.get("directive") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [api, setApi] = useState<ApiResult | null>(null);

  useEffect(() => {
    if (!directive) return;
    (async () => {
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
        setApi(json);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [directive]);

  useEffect(() => {
    if (!directive) router.push("/");
  }, [directive, router]);

  //--------------------------------- Render states
  if (!directive) return null;
  if (loading)
    return (
      <PageShell>
        <p style={{ textAlign: "center", padding: "4rem" }}>Loading…</p>
      </PageShell>
    );
  if (error)
    return (
      <PageShell>
        <p style={{ textAlign: "center", color: "salmon", padding: "4rem" }}>{error}</p>
      </PageShell>
    );
  if (!api)
    return (
      <PageShell>
        <p style={{ textAlign: "center", padding: "4rem" }}>No data.</p>
      </PageShell>
    );

  //--------------------------------- Normalize data regardless of shape
  const articles: StructuredArticle[] = isStructured(api)
    ? api.web_monitor.articles
    : (api.web_monitor as string[]).map(parseBulletHeadline);

  const trendLines = isStructured(api)
    ? api.trend_analyzer
    : { interest_over_time: {}, current_interest: 0, sentiment: null, trending_queries: (api.trend_analyzer as string[]) } as StructuredTrend;

  const summaryBullets = isStructured(api)
    ? api.summary_agent.bullets
    : api.summary_agent as string[];

  // Prepare sparkline data (if we have time series numbers)
  const iotEntries = Object.entries(trendLines.interest_over_time || {});
  iotEntries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const sparkValues = iotEntries.map(([, v]) => v);

  const gNews = `https://news.google.com/search?q=${encodeURIComponent(directive)}`;
  const wiki = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(directive)}`;

  //--------------------------------- Page
  return (
    <PageShell>
      {/* HERO */}
      <section className="hero">
        <h1 className="hero-h1">MarketScope Results</h1>
        <p className="hero-sub">“{directive}”</p>
        <div className="hero-links">
          <a href={gNews} target="_blank" rel="noopener noreferrer">Google News ↗</a>
          <span>•</span>
          <a href={wiki} target="_blank" rel="noopener noreferrer">Wikipedia ↗</a>
        </div>
      </section>

      {/* WEB MONITOR */}
      <Section title="Web Monitor" subtitle="Latest headlines (live RSS)">
        {articles.length === 0 ? (
          <p style={{ color: "#8b949e" }}>No articles found.</p>
        ) : (
          <div className="articles-grid">
            {articles.map((a, i) => (
              <a key={i} href={a.url || gNews} target="_blank" rel="noopener noreferrer" className="article-card">
                <div className="img-wrap">
                  <img src={a.thumbnail || unsplashFor(a.title)} alt="thumb" />
                </div>
                <div className="card-body">
                  <h3>{a.title}</h3>
                  {a.url && <p className="host">{new URL(a.url).hostname.replace("www.","")}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* TREND ANALYZER */}
      <Section title="Trend Analyzer" subtitle="Interest & sentiment overview">
        {sparkValues.length > 0 ? (
          <div className="trend-box">
            <Sparklines data={sparkValues} width={220} height={60} />
            <p className="trend-current">Current interest: <strong>{trendLines.current_interest}</strong></p>
          </div>
        ) : (
          <p style={{ color: "#8b949e" }}>No numerical trend data.</p>
        )}
        {trendLines.trending_queries?.length > 0 && (
          <p className="queries">🔥 {trendLines.trending_queries.join(", ")}</p>
        )}
      </Section>

      {/* SUMMARY */}
      <Section title="AI Summary" subtitle="Concise takeaways">
        <ul className="summary-list">
          {summaryBullets.map((s, i) => (
            <li key={i}><span className="chevron">›</span> {s.replace(/^•\s*/, "")}</li>
          ))}
        </ul>
      </Section>

      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <button className="back" onClick={() => router.push("/")}>⟵ Back</button>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        :global(body){background:#010409;color:#e6edf3;font-family:Inter,sans-serif}
        .hero{text-align:center;padding:2.5rem 0 3rem}
        .hero-h1{font-size:2.2rem;margin:0}
        .hero-sub{color:#8b949e;margin-top:0.25rem}
        .hero-links{margin-top:0.75rem;font-size:0.95rem;display:inline-flex;gap:0.5rem}
        .hero-links a{color:#00ffff;text-decoration:none}
        .hero-links a:hover{text-decoration:underline}
        /* articles */
        .articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.25rem}
        .article-card{display:flex;flex-direction:column;background:#1a1f2e;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;text-decoration:none;color:inherit;transition:transform 0.2s,box-shadow 0.2s}
        .article-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,0.6)}
        .img-wrap img{width:100%;height:150px;object-fit:cover}
        .card-body{padding:0.8rem 1rem}
        .card-body h3{margin:0 0 0.4rem;font-size:1rem;line-height:1.4}
        .host{font-size:0.82rem;color:#8b949e}
        /* trend */
        .trend-box{display:flex;align-items:center;gap:1rem}
        .trend-current{margin:0;font-size:0.95rem;color:#c9d1d9}
        .queries{margin-top:0.5rem;font-size:0.9rem;color:#8b949e}
        /* summary */
        .summary-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.8rem}
        .summary-list li{background:#1a1f2e;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:0.85rem 1rem;font-size:0.95rem;display:flex;align-items:center;gap:0.4rem}
        .chevron{color:#00ffff}
        /* btn */
        .back{background:transparent;color:#00ffff;border:1px solid #00ffff;border-radius:4px;padding:0.5rem 1.25rem;font-weight:600;cursor:pointer}
        .back:hover{background:#00ffff;color:#010409}
      `}</style>
    </PageShell>
  );
}
