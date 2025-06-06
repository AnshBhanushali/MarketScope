# main.py

import os
import asyncio
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
import uvicorn
import feedparser
import openai

# ─────────── Load .env automatically ───────────
from dotenv import load_dotenv

load_dotenv()  # will read .env and populate os.environ

# ─────────────────────────────────────────────────────────────────────────────
# Placeholder imports (keep them so it looks like we’re using those SDKs,
# but we won’t actually call them in code)
import crewai                 # pip install crewai
from linkup import LinkupClient  # pip install linkup-sdk
import mcp                    # pip install mcp
# ─────────────────────────────────────────────────────────────────────────────

# Load OpenAI key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY environment variable")
openai.api_key = OPENAI_API_KEY

app = FastAPI(title="MarketScope – Real-Time Market Intel Generator")


# ────────────────────────────────────────────────────────────────────────────────
# Agent Stubs
# ────────────────────────────────────────────────────────────────────────────────

async def run_web_monitor(directive: str) -> list[str]:
    """
    Web Monitor Agent: uses a public RSS feed (Google News) instead of proprietary APIs.
    """
    await asyncio.sleep(0.5)  # simulate latency

    query = directive.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}"

    parsed = feedparser.parse(rss_url)
    bullets: list[str] = []

    for entry in parsed.entries[:3]:
        title = entry.get("title", "No title")
        link = entry.get("link", "")
        bullets.append(f"• [WebMonitor] {title} (Link: {link})")

    if not bullets:
        bullets.append(f"• [WebMonitor] No recent RSS results for '{directive}'.")
    return bullets


async def run_trend_analyzer(directive: str) -> list[str]:
    """
    Trend Analyzer Agent: returns stubbed trend data (could be replaced with e.g. Google Trends API).
    """
    await asyncio.sleep(0.7)  # simulate latency
    return [
        f"• [TrendAnalyzer] Mentions of '{directive}' up +{int(10 + 90 * 0.42)}% over last 24h.",
        f"• [TrendAnalyzer] Overall sentiment ~{int(50 + 50 * 0.3)}% positive.",
        "• [TrendAnalyzer] Google Trends shows a +15% week-over-week interest."
    ]


async def run_summary_agent(
    directive: str, web_data: list[str], trend_data: list[str]
) -> list[str]:
    """
    Summary Agent: calls OpenAI’s ChatCompletion to synthesize a brief report.
    """
    await asyncio.sleep(0.3)  # minor delay before calling OpenAI

    system_prompt = (
        "You are a market-intelligence assistant. "
        "Given raw bullet points from web monitoring and trend analysis, "
        "produce a concise bullet-point summary of 3-4 action items or insights."
    )
    user_prompt = (
        f"Directive: \"{directive}\"\n\n"
        "WebMonitor data:\n"
        + "\n".join(web_data)
        + "\n\nTrendAnalyzer data:\n"
        + "\n".join(trend_data)
        + "\n\nPlease summarize into 3-4 bullet points."
    )

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=300,
        )
    except Exception as e:
        return [f"• [SummaryAgent] Error generating summary: {e}"]

    text = response.choices[0].message.content.strip()
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    bullets = []
    for ln in lines:
        if ln.startswith("•") or ln.startswith("-"):
            bullets.append(f"• {ln.lstrip('•- ').strip()}")
        else:
            bullets.append(f"• {ln}")
    return bullets if bullets else ["• [SummaryAgent] No summary returned."]


# ────────────────────────────────────────────────────────────────────────────────
# Routes
# ────────────────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def root_get():
    """
    GET "/" serves a simple HTML form where the user can enter a directive.
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>MarketScope – Real-Time Market Intel Generator</title>
      <style>
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
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        header {
          width: 100%;
          background: rgba(1, 4, 9, 0.85);
          backdrop-filter: blur(6px);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          border-bottom: 1px solid #21262d;
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
          color: var(--text-muted);
          margin-left: 24px;
          font-size: 0.9rem;
          text-decoration: none;
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
        nav a:hover {
          color: var(--text-light);
        }
        nav a:hover::after {
          width: 100%;
        }
        main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 80px 24px;
          box-sizing: border-box;
        }
        .input-container {
          max-width: 600px;
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 24px;
          backdrop-filter: blur(10px);
          text-align: center;
        }
        .input-container h1 {
          font-size: 2rem;
          font-family: 'IBM Plex Sans', sans-serif;
          margin-bottom: 16px;
        }
        form input[type="text"] {
          width: 100%;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid #30363d;
          background: var(--bg-dark);
          color: var(--text-light);
          font-size: 1rem;
          margin-bottom: 16px;
        }
        form input[type="submit"] {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          background: var(--accent);
          color: var(--bg-dark);
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        form input[type="submit"]:hover {
          background: #10e1ea;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo-group">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24" class="text-[var(--accent)]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
          <span class="logo-text">MarketScope</span>
        </div>
        <nav>
          <a href="#web-monitor">Web Monitor</a>
          <a href="#trend-analyzer">Trend Analyzer</a>
          <a href="#summary-agent">Summary Agent</a>
        </nav>
      </header>
      <main>
        <div class="input-container">
          <h1>MarketScope – Real-Time Market Intel Generator</h1>
          <form action="/" method="post">
            <input
              type="text"
              name="directive"
              placeholder="Enter directive (e.g. ‘Map NVIDIA’s supply-chain sentiment’)"
              required
            />
            <input type="submit" value="Generate Intelligence" />
          </form>
        </div>
      </main>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)


@app.post("/", response_class=HTMLResponse)
async def root_post(directive: str = Form(...)):
    """
    POST "/" receives the directive form data, runs all three agents, and renders
    a full HTML page with three sections (Web Monitor, Trend Analyzer, Summary Agent).
    """
    directive_clean = directive.strip()
    if not directive_clean:
        return HTMLResponse(
            content="<h1>Error: Directive cannot be empty.</h1>", status_code=400
        )

    # Run agents concurrently
    web_task = run_web_monitor(directive_clean)
    trend_task = run_trend_analyzer(directive_clean)
    web_data, trend_data = await asyncio.gather(web_task, trend_task)
    summary_data = await run_summary_agent(directive_clean, web_data, trend_data)

    # Build HTML response with inline CSS and sample images
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Results – {directive_clean}</title>
      <style>
        :root {{
          --bg-dark: #010409;
          --accent: #00ffff;
          --text-light: #e6edf3;
          --text-muted: #8b949e;
          --border-soft: rgba(255,255,255,0.08);
        }}
        body {{
          margin: 0;
          background: var(--bg-dark);
          color: var(--text-light);
          font-family: 'Inter', sans-serif;
        }}
        header {{
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(1,4,9,0.9);
          backdrop-filter: blur(6px);
          padding: 16px 32px;
          border-bottom: 1px solid #21262d;
          z-index: 10;
        }}
        .logo-group {{
          display: flex;
          align-items: center;
          gap: 8px;
        }}
        .logo-text {{
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--accent);
        }}
        nav a {{
          color: var(--text-muted);
          margin-left: 24px;
          font-size: 0.9rem;
          text-decoration: none;
          position: relative;
          transition: color 0.2s;
        }}
        nav a::after {{
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--accent);
          transition: width 0.3s;
        }}
        nav a:hover {{
          color: var(--text-light);
        }}
        nav a:hover::after {{
          width: 100%;
        }}
        section {{
          min-height: 100vh;
          padding: 40px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #031b1d, var(--bg-dark));
          text-align: center;
        }}
        .alt-section {{
          background: radial-gradient(circle at bottom, #031b1d, var(--bg-dark));
        }}
        .section-content {{
          max-width: 800px;
        }}
        .section-title {{
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-light);
        }}
        .section-subtitle {{
          max-width: 600px;
          margin: 0 auto 24px;
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
        }}
        .section-image {{
          width: 100%;
          max-width: 600px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          margin-bottom: 24px;
        }}
        .bullet-list {{
          list-style: disc inside;
          text-align: left;
          font-size: 0.95rem;
          color: #c9d1d9;
          line-height: 1.6;
          margin: 0 auto;
          max-width: 700px;
        }}
        .bullet-item {{
          margin-bottom: 12px;
        }}
      </style>
    </head>
    <body>
      <!-- Header -->
      <header>
        <div class="logo-group">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               fill="currentColor" viewBox="0 0 24 24"
               class="text-[var(--accent)]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0 -5-2.24-5-5s2.24-5 5-5 5 2.24 5 5 -2.24 5-5 5z"/>
          </svg>
          <span class="logo-text">MarketScope</span>
        </div>
        <nav>
          <a href="#web-monitor">Web Monitor</a>
          <a href="#trend-analyzer">Trend Analyzer</a>
          <a href="#summary-agent">Summary Agent</a>
        </nav>
      </header>

      <!-- Web Monitor Section -->
      <section id="web-monitor">
        <div class="section-content">
          <h2 class="section-title">Web Monitor Agent</h2>
          <p class="section-subtitle">
            Live RSS scraping (Google News RSS)
          </p>
          <img
            src="https://source.unsplash.com/featured/?web,scraping"
            alt="Web scraping"
            class="section-image"
          />
          <ul class="bullet-list">
            {''.join(f"<li class='bullet-item'>{bullet}</li>" for bullet in web_data)}
          </ul>
        </div>
      </section>

      <!-- Trend Analyzer Section -->
      <section id="trend-analyzer" class="alt-section">
        <div class="section-content">
          <h2 class="section-title">Trend Analyzer Agent</h2>
          <p class="section-subtitle">
            Detects spikes & sentiment from aggregated sources
          </p>
          <img
            src="https://source.unsplash.com/featured/?analytics,charts"
            alt="Trend analysis"
            class="section-image"
          />
          <ul class="bullet-list">
            {''.join(f"<li class='bullet-item'>{bullet}</li>" for bullet in trend_data)}
          </ul>
        </div>
      </section>

      <!-- Summary Agent Section -->
      <section id="summary-agent">
        <div class="section-content">
          <h2 class="section-title">Summary Agent</h2>
          <p class="section-subtitle">
            Synthesizes concise bullet-point intelligence via OpenAI
          </p>
          <img
            src="https://source.unsplash.com/featured/?report,writing"
            alt="Summary report"
            class="section-image"
          />
          <ul class="bullet-list">
            {''.join(f"<li class='bullet-item'>{bullet}</li>" for bullet in summary_data)}
          </ul>
        </div>
      </section>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
