# main.py

import os
import asyncio
from typing import List
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import feedparser
import openai

import crewai       
from linkup import LinkupClient  
import mcp           

# ────────────────────────────────────────────────────────────────────────────────
# Load .env and grab OPENAI_API_KEY
# ────────────────────────────────────────────────────────────────────────────────
load_dotenv()  # load variables from .env in the same folder

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY environment variable")
openai.api_key = OPENAI_API_KEY

app = FastAPI(title="MarketScope – Real-Time Market Intel Generator")

origins = [
    "http://localhost:3000",  # your Next.js dev server
    # Add other origins if needed (e.g. your production domain)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],       # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],       # allow all headers
)

# ────────────────────────────────────────────────────────────────────────────────
# Pydantic model for incoming request
# ────────────────────────────────────────────────────────────────────────────────
class DirectiveRequest(BaseModel):
    directive: str


# ────────────────────────────────────────────────────────────────────────────────
# Agent Stubs
# ────────────────────────────────────────────────────────────────────────────────
async def run_web_monitor(directive: str) -> List[str]:
    """
    Web Monitor Agent: uses Google News RSS (public) instead of paid APIs.
    """
    await asyncio.sleep(0.5)  # simulate latency

    query = directive.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}"

    parsed = feedparser.parse(rss_url)
    bullets: List[str] = []

    for entry in parsed.entries[:3]:
        title = entry.get("title", "No title")
        link = entry.get("link", "")
        bullets.append(f"• [WebMonitor] {title} (Link: {link})")

    if not bullets:
        bullets.append(f"• [WebMonitor] No recent RSS results for '{directive}'.")
    return bullets


async def run_trend_analyzer(directive: str) -> List[str]:
    """
    Trend Analyzer Agent: returns stubbed trend data (could be replaced with
    Google Trends API or similar).
    """
    await asyncio.sleep(0.7)  # simulate latency
    mentions_pct = int(10 + 90 * 0.42)  # ~47
    sentiment_pct = int(50 + 50 * 0.3)  # ~65
    return [
        f"• [TrendAnalyzer] Mentions of '{directive}' up +{mentions_pct}% over last 24h.",
        f"• [TrendAnalyzer] Overall sentiment ~{sentiment_pct}% positive.",
        "• [TrendAnalyzer] Google Trends shows a +15% week-over-week interest."
    ]


async def run_summary_agent(
    directive: str, web_data: List[str], trend_data: List[str]
) -> List[str]:
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
    bullets: List[str] = []
    for ln in lines:
        if ln.startswith("•") or ln.startswith("-"):
            bullets.append(f"• {ln.lstrip('•- ').strip()}")
        else:
            bullets.append(f"• {ln}")
    return bullets if bullets else ["• [SummaryAgent] No summary returned."]


# ────────────────────────────────────────────────────────────────────────────────
# Routes
# ────────────────────────────────────────────────────────────────────────────────
@app.get("/", response_class=JSONResponse)
async def root_get():
    """
    GET "/" returns a simple JSON instruction.
    """
    return {"message": "Send a POST to / with JSON: {\"directive\": \"Your query here\"}"}


@app.post("/", response_class=JSONResponse)
async def root_post(request: DirectiveRequest):
    """
    POST "/" accepts a JSON body with {"directive": "..."} and returns JSON with
    three keys: web_monitor, trend_analyzer, summary_agent.
    """
    directive_clean = request.directive.strip()
    if not directive_clean:
        raise HTTPException(status_code=400, detail="Directive cannot be empty.")

    # Run agents concurrently
    web_task = run_web_monitor(directive_clean)
    trend_task = run_trend_analyzer(directive_clean)
    web_data, trend_data = await asyncio.gather(web_task, trend_task)
    summary_data = await run_summary_agent(directive_clean, web_data, trend_data)

    return {
        "directive": directive_clean,
        "web_monitor": web_data,
        "trend_analyzer": trend_data,
        "summary_agent": summary_data,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
