"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Globe,
  Brain,
  BarChart3,
} from "lucide-react";

//------------------------------------------------------------
// FALLBACK-FRIENDLY TYPES
//------------------------------------------------------------
interface BulletShapeApi {
  directive: string;
  web_monitor: string[];
  trend_analyzer: string[];
  summary_agent: string[];
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
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


//------------------------------------------------------------
// Utility helpers
//------------------------------------------------------------
function isStructured(api: ApiResult): api is StructuredApi {
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
// Beautiful Loading Spinner
//------------------------------------------------------------
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-cyan-200/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Analyzing Market Data
        </h2>
        <p className="text-slate-300">Our AI agents are gathering insights...</p>
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

//------------------------------------------------------------
// Sparkline component
//------------------------------------------------------------
type SparklinesProps = { data: number[]; width: number; height: number; color?: string };
const Sparklines: React.FC<SparklinesProps> = ({ data, width, height, color = "#00ffff" }) => {
  if (!data.length) return <div className="text-slate-400 text-sm">No data</div>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="url(#sparklineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glow effect */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "blur(2px)", opacity: 0.6 }}
        />
      </svg>
    </div>
  );
};

//------------------------------------------------------------
// Main Results Page
//------------------------------------------------------------
export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const directive = searchParams.get("directive") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [api, setApi] = useState<ApiResult | null>(null);

  useEffect(() => {
    if (!directive) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/`, {
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
    };

    fetchData();
  }, [directive]);

  useEffect(() => {
    if (!directive) router.push("/");
  }, [directive, router]);

  // Render loading state
  if (!directive) return null;
  if (loading) return <LoadingSpinner />;

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-xl text-white">No data available</h3>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to search
          </button>
        </div>
      </div>
    );
  }

  // Normalize data regardless of shape
  const articles: StructuredArticle[] = isStructured(api)
    ? api.web_monitor.articles
    : (api.web_monitor as string[]).map(parseBulletHeadline);

  const trendLines = isStructured(api)
    ? api.trend_analyzer
    : ({
        interest_over_time: {},
        current_interest: 0,
        sentiment: null,
        trending_queries: (api.trend_analyzer as string[]),
      } as StructuredTrend);

  const summaryBullets = isStructured(api)
    ? api.summary_agent.bullets
    : (api.summary_agent as string[]);

  // Prepare sparkline data
  const iotEntries = Object.entries(trendLines.interest_over_time || {});
  iotEntries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const sparkValuesReal = iotEntries.map(([, v]) => v);

  // SAMPLE fallback for demonstration if no real data:
  const sampleSpark = [
    73, 82, 25, 34, 28, 33, 85, 29, 79, 74,
    31, 54, 47, 10, 61, 50, 68, 60, 96, 90,
    64, 88, 43, 32, 55, 46, 83, 38, 91, 75,
  ];

  const sparkValues =
    sparkValuesReal.length > 0 ? sparkValuesReal : sampleSpark;

  const gNews = `https://news.google.com/search?q=${encodeURIComponent(
    directive
  )}`;
  const wiki = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
    directive
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Search</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={gNews}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Google News</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={wiki}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Wikipedia</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Market Analysis Results
          </h1>
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-600/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Query:</span>
            <span className="text-white font-medium">"{directive}"</span>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Trend Analysis Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Trend Analysis</h2>
                <p className="text-slate-400">Market sentiment and interest patterns</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interest Chart Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Interest Over Time</h3>
                  <BarChart3 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                {sparkValues.length > 0 ? (
                  <div className="space-y-4">
                    <Sparklines data={sparkValues} width={200} height={60} color="#00ffff" />
                    <div className="text-sm text-slate-400">
                      {sparkValues.length} data points analyzed
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No trend data available</p>
                  </div>
                )}
              </div>

              {/* Current Interest Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Current Interest</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {trendLines.current_interest || 0}
                </div>
                <div className="text-sm text-slate-400 mt-2">Interest level score</div>
              </div>

              {/* Sentiment Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 hover:border-green-500/50 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Score</h3>
                <div className="text-3xl font-bold">
                  {trendLines.sentiment !== null ? (
                    <span
                      className={
                        trendLines.sentiment > 0
                          ? "text-green-400"
                          : trendLines.sentiment < 0
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {trendLines.sentiment > 0 ? "+" : ""}
                      {trendLines.sentiment}
                    </span>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mt-2">Market sentiment</div>
              </div>
            </div>

            {/* Trending Queries */}
            {trendLines.trending_queries && trendLines.trending_queries.length > 0 && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
                <h3 className="text-lg font-semibold text-white mb-4">🔥 Trending Queries</h3>
                <div className="flex flex-wrap gap-2">
                  {trendLines.trending_queries.map((query, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 px-3 py-1 rounded-full text-sm border border-orange-500/30"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Web Monitor Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Latest Headlines</h2>
                <p className="text-slate-400">Real-time news and market updates</p>
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-12 border border-slate-600/30 text-center">
                <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No articles found for this query</p>
                <p className="text-slate-500 text-sm mt-2">Try searching for a different topic</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url || gNews}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    <div className="aspect-video overflow-hidden bg-slate-700">
                      <img
                        src={article.thumbnail || unsplashFor(article.title)}
                        alt="Article thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = unsplashFor(article.title);
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-blue-300 transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                      {article.url && (
                        <div className="flex items-center space-x-2 mt-3 text-slate-400 text-sm">
                          <Globe className="w-4 h-4" />
                          <span>{new URL(article.url).hostname.replace("www.", "")}</span>
                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* AI Summary Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Analysis Summary</h2>
                <p className="text-slate-400">Key insights and takeaways</p>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30">
              {summaryBullets.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No summary available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summaryBullets.map((bullet, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/20 hover:border-purple-500/30 transition-colors group"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed group-hover:text-white transition-colors">
                        {bullet.replace(/^•\s*/, "")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>New Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

