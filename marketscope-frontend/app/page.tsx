"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Search, TrendingUp, Activity, Brain, Globe, BarChart3, Target, Zap, ArrowRight, Menu, X } from "lucide-react";

const Index = () => {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exampleQueries] = useState([
    "Dissect Apple's generative-AI hiring velocity in Q2 2025",
    "Contrast OpenAI & Anthropic's patent filings last 18 months", 
    "Surface regulatory risk signals for crypto-custody startups",
    "Map NVIDIA's supply-chain sentiment week-over-week",
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?directive=${encodeURIComponent(query)}`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .float {
          animation: float 6s ease-in-out infinite;
        }

        .spin-slow {
          animation: spinSlow 20s linear infinite;
        }

        .spin-reverse {
          animation: spinReverse 15s linear infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-scale:hover {
          transform: scale(1.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .loading-ring {
          width: 120px;
          height: 120px;
          border: 4px solid rgba(6, 182, 212, 0.1);
          border-radius: 50%;
          border-top: 4px solid #06b6d4;
          animation: spin 1s linear infinite;
        }

        .loading-ring-inner {
          width: 80px;
          height: 80px;
          border: 2px solid rgba(6, 182, 212, 0.2);
          border-radius: 50%;
          border-top: 2px solid #22d3ee;
          animation: spinReverse 0.8s linear infinite;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.6);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
        }

        .border-glow {
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
        }

        .border-glow:hover {
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
        }

        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Loading Animation */}
        {showIntro && (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
            <div className="relative">
              <div className="loading-ring"></div>
              <div className="loading-ring-inner"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center pulse-glow">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="absolute mt-48 text-3xl font-bold gradient-text text-shadow-glow fade-in-delay">
              MarketScope
            </h1>
          </div>
        )}

        {/* Header */}
        <header className="fixed top-0 w-full glass-effect z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center hover-scale">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  MarketScope
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection("agents")}
                  className="text-slate-400 hover:text-cyan-400 smooth-transition font-medium relative group"
                >
                  Agents
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 smooth-transition group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-slate-400 hover:text-cyan-400 smooth-transition font-medium relative group"
                >
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 smooth-transition group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection("use-cases")}
                  className="text-slate-400 hover:text-cyan-400 smooth-transition font-medium relative group"
                >
                  Use Cases
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 smooth-transition group-hover:w-full"></span>
                </button>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 smooth-transition hover-scale">
                  Get Started
                </button>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-slate-400 hover:text-white smooth-transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden glass-effect border-t border-slate-700">
              <div className="px-4 py-6 space-y-4">
                <button
                  onClick={() => scrollToSection("agents")}
                  className="block w-full text-left text-slate-400 hover:text-cyan-400 smooth-transition font-medium"
                >
                  Agents
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left text-slate-400 hover:text-cyan-400 smooth-transition font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("use-cases")}
                  className="block w-full text-left text-slate-400 hover:text-cyan-400 smooth-transition font-medium"
                >
                  Use Cases
                </button>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 smooth-transition">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
          <div className="absolute inset-0 bg-gradient-radial"></div>
          <div className="absolute inset-0 grid-pattern opacity-50"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8 fade-in">
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">Clarity Amid</span>
                  <span className="block gradient-text">
                    Market Chaos
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                  MarketScope fuses AI-driven agents with live data feeds to transform raw signals into 
                  strategic insights—delivered instantly, so you can outpace competitors.
                </p>
              </div>

              {/* Value Propositions */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base fade-in-delay">
                <div className="flex items-center space-x-2 glass-effect rounded-full px-4 py-2 hover-lift">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Monitoring</span>
                </div>
                <div className="flex items-center space-x-2 glass-effect rounded-full px-4 py-2 hover-lift">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Trend Analysis</span>
                </div>
                <div className="flex items-center space-x-2 glass-effect rounded-full px-4 py-2 hover-lift">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <span>AI-Powered Insights</span>
                </div>
              </div>

              {/* Search Section */}
              <div className="max-w-4xl mx-auto space-y-6 slide-up">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Draft a directive... (e.g., Analyze OpenAI's latest product launches)"
                      className="w-full pl-12 pr-16 py-4 text-lg glass-effect rounded-2xl border-glow smooth-transition placeholder-slate-500 text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 smooth-transition hover-scale"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {/* Example Queries */}
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">Try these examples:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exampleQueries.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(example)}
                        className="text-left p-4 glass-effect border-glow rounded-xl smooth-transition text-sm group hover-lift"
                      >
                        <span className="text-slate-300 group-hover:text-cyan-400 smooth-transition">
                          {example}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="py-20 lg:py-32 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                AI <span className="gradient-text">Agents</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                A multi-agent system that monitors competitors, product launches, investor news, 
                and synthesizes competitive intelligence in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group glass-effect border-glow rounded-2xl p-8 smooth-transition hover-lift">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 smooth-transition float">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 smooth-transition">Web Monitor Agent</h3>
                <p className="text-slate-400 leading-relaxed">
                  Continuously scrapes APIs from TechCrunch, Crunchbase, and social platforms to gather 
                  live data on competitors and product launches.
                </p>
              </div>

              <div className="group glass-effect border-glow rounded-2xl p-8 smooth-transition hover-lift">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 smooth-transition float" style={{animationDelay: '2s'}}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 smooth-transition">Trend Analyzer Agent</h3>
                <p className="text-slate-400 leading-relaxed">
                  Detects spikes, mention surges, and sentiment trends across news articles, 
                  social media, and industry reports using advanced ML algorithms.
                </p>
              </div>

              <div className="group glass-effect border-glow rounded-2xl p-8 smooth-transition hover-lift md:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 smooth-transition float" style={{animationDelay: '4s'}}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 smooth-transition">Summary Agent</h3>
                <p className="text-slate-400 leading-relaxed">
                  Delivers concise, bullet-point competitive intelligence reports enabling rapid 
                  decision-making without manual research overhead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Powerful <span className="gradient-text">Features</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Built with cutting-edge AI frameworks and designed for enterprise-grade performance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4 hover-lift smooth-transition">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 pulse-glow">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Real-Time Processing</h3>
                    <p className="text-slate-400">Lightning-fast data processing with sub-second response times for critical market insights.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 hover-lift smooth-transition">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 pulse-glow" style={{animationDelay: '1s'}}>
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Precision Targeting</h3>
                    <p className="text-slate-400">Advanced algorithms identify the most relevant signals while filtering out noise automatically.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 hover-lift smooth-transition">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 pulse-glow" style={{animationDelay: '2s'}}>
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Interactive Analytics</h3>
                    <p className="text-slate-400">Rich visualizations and interactive dashboards that make complex data immediately actionable.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="glass-effect border-glow rounded-2xl p-8 hover-lift smooth-transition">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Tech Stack</span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-glow"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover-lift smooth-transition">
                        <span className="font-medium">CrewAI</span>
                        <span className="text-cyan-400 text-sm">Multi-agent orchestration</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover-lift smooth-transition">
                        <span className="font-medium">LangChain</span>
                        <span className="text-purple-400 text-sm">LLM integration</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover-lift smooth-transition">
                        <span className="font-medium">Pinecone</span>
                        <span className="text-emerald-400 text-sm">Vector database</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover-lift smooth-transition">
                        <span className="font-medium">LinkUp API</span>
                        <span className="text-blue-400 text-sm">Market data</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-20 lg:py-32 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Use <span className="gradient-text">Cases</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Trusted by startups, VC firms, and enterprise marketing teams worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-6 hover-lift smooth-transition">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Startups</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Benchmark competitors, identify emerging market gaps, and track funding landscapes 
                    to position your startup strategically.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-6 hover-lift smooth-transition">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto pulse-glow" style={{animationDelay: '1s'}}>
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">VC Analysts</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Monitor startup valuation signals, funding activity patterns, and market timing 
                    indicators for informed investment decisions.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-6 hover-lift smooth-transition">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto pulse-glow" style={{animationDelay: '2s'}}>
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Marketers</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Track product launches, campaign sentiment, brand positioning changes, 
                    and competitive messaging strategies in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center hover-scale">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">
                  MarketScope
                </span>
              </div>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Transforming market intelligence through AI-powered insights. 
                Stay ahead of the competition with real-time competitive analysis.
              </p>
              <div className="text-sm text-slate-500">
                © {new Date().getFullYear()} MarketScope Inc. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;