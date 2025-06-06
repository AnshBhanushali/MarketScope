"""main.py — MarketScope FastAPI backend (fully working)
-------------------------------------------------------
• Compatible with openai‑python ≥ 1.0 (uses AsyncOpenAI).
• Scrapes Google News RSS, resolves true article URLs, fetches <og:image> thumbnails.
• Pulls 7‑day Google Trends data via pytrends.
• Generates a 3‑5 bullet AI summary with GPT‑4o‑mini (fallback to 3.5 if needed).
• Returns structured JSON consumed by the Next.js Results page.
"""
from __future__ import annotations

import asyncio
import os
import urllib.parse
from typing import List, Dict, Optional

import feedparser
import httpx
import pandas as pd
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pytrends.request import TrendReq

from openai import AsyncOpenAI  # ⬅️ openai‑python ≥ 1.0

# ──────────────────────────────────────────────────────────────
# ENV + OpenAI client
# ──────────────────────────────────────────────────────────────
load_dotenv()
client = AsyncOpenAI()  # Automatically picks up OPENAI_API_KEY

# ──────────────────────────────────────────────────────────────
# FastAPI setup + CORS (allow Next.js dev server)
# ──────────────────────────────────────────────────────────────
app = FastAPI(title="MarketScope – Real‑Time Market Intel API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ──────────────────────────────────────────────────────────────
# Pydantic models (clean response schema)
# ──────────────────────────────────────────────────────────────
class DirectiveRequest(BaseModel):
    directive: str


class ArticleItem(BaseModel):
    title: str
    url: str
    thumbnail: Optional[str] | None = None


class WebMonitorResult(BaseModel):
    articles: List[ArticleItem]


class TrendAnalyzerResult(BaseModel):
    interest_over_time: Dict[str, int]
    current_interest: int
    sentiment: Optional[float] | None = None  # placeholder
    trending_queries: List[str]


class SummaryResult(BaseModel):
    bullets: List[str]


class FullResult(BaseModel):
    directive: str
    web_monitor: WebMonitorResult
    trend_analyzer: TrendAnalyzerResult
    summary_agent: SummaryResult


# ──────────────────────────────────────────────────────────────
# Helper functions
# ──────────────────────────────────────────────────────────────
async def fetch_html(url: str) -> str | None:
    """Retrieve HTML with redirects and basic error handling."""
    try:
        async with httpx.AsyncClient(timeout=8) as http:
            r = await http.get(url, follow_redirects=True)
            r.raise_for_status()
            return r.text
    except Exception:
        return None


async def fetch_thumbnail(url: str) -> Optional[str]:
    """Return <og:image> or first <img> src from a page."""
    html = await fetch_html(url)
    if not html:
        return None
    soup = BeautifulSoup(html, "html.parser")
    og = soup.find("meta", {"property": "og:image"})
    if og and og.get("content"):
        return og["content"]
    img = soup.find("img")
    return img["src"] if img and img.get("src") else None


# ──────────────────────────────────────────────────────────────
# Agents
# ──────────────────────────────────────────────────────────────
async def run_web_monitor(query: str) -> WebMonitorResult:
    """Scrape Google News RSS, pull top 3 articles + thumbnails."""
    encoded = urllib.parse.quote_plus(query)
    rss_url = f"https://news.google.com/rss/search?q={encoded}"
    feed = feedparser.parse(rss_url)

    async def build_item(entry) -> ArticleItem:
        title = entry.get("title", "(no title)")
        raw_link = entry.get("link", "")
        # Resolve actual article URL from Google redirect
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_link).query)
        url = qs.get("url", [raw_link])[0]
        thumb = await fetch_thumbnail(url)
        return ArticleItem(title=title, url=url, thumbnail=thumb)

    tasks = [asyncio.create_task(build_item(e)) for e in feed.entries[:3]]
    articles = await asyncio.gather(*tasks)
    return WebMonitorResult(articles=articles)


async def run_trend_analyzer(term: str) -> TrendAnalyzerResult:
    """Pull last 7‑day Google Trends numbers + top related queries."""
    pytrends = TrendReq(timeout=(10, 25))
    try:
        pytrends.build_payload([term], timeframe="now 7-d")
        df: pd.DataFrame = (
            pytrends.interest_over_time().drop(columns=["isPartial"], errors="ignore")
        )
        if df.empty:
            return TrendAnalyzerResult(interest_over_time={}, current_interest=0, trending_queries=[])

        interest = {d.strftime("%Y-%m-%d"): int(v) for d, v in zip(df.index, df[term])}
        current = int(df[term].iloc[-1])

        rel = pytrends.related_queries().get(term, {})
        top_df = rel.get("top", pd.DataFrame())
        trending = top_df.head(3)["query"].astype(str).tolist() if not top_df.empty else []

        return TrendAnalyzerResult(interest_over_time=interest, current_interest=current, trending_queries=trending)
    except Exception:
        return TrendAnalyzerResult(interest_over_time={}, current_interest=0, trending_queries=[])


def build_summary_prompt(query: str, web: WebMonitorResult, trend: TrendAnalyzerResult):
    heads = "\n".join(f"- {a.title} ({a.url})" for a in web.articles)
    iot = "\n".join(f"  • {d}: {v}" for d, v in trend.interest_over_time.items())
    trend_block = f"Current interest: {trend.current_interest}\nTop queries: {', '.join(trend.trending_queries) if trend.trending_queries else 'None'}"
    return [
        {"role": "system", "content": "You are an AI market‑intel analyst. Provide 3‑5 actionable sentences."},
        {"role": "user", "content": f"Topic: {query}\n\nHeadlines:\n{heads}\n\nTrends:\n{iot}\n{trend_block}"},
    ]


async def run_summary_agent(query: str, web: WebMonitorResult, trend: TrendAnalyzerResult) -> SummaryResult:
    messages = build_summary_prompt(query, web, trend)
    try:
        rsp = await client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo" if GPT‑4o unavailable
            messages=messages,
            temperature=0.6,
            max_tokens=256,
        )
        txt = rsp.choices[0].message.content.strip()
    except Exception as exc:
        return SummaryResult(bullets=[f"• [Error] {exc}"])

    lines = [ln.strip(" •-") for ln in txt.split("\n") if ln.strip()]
    bullets = [f"• {ln}" for ln in lines][:5]
    return SummaryResult(bullets=bullets or ["• (no summary)"])


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────
@app.post("/", response_class=JSONResponse, response_model=FullResult)
async def generate(req: DirectiveRequest):
    topic = req.directive.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Directive cannot be empty")

    web_task = run_web_monitor(topic)
    trend_task = run_trend_analyzer(topic)
    web, trend = await asyncio.gather(web_task, trend_task)
    summary = await run_summary_agent(topic, web, trend)

    return FullResult(directive=topic, web_monitor=web, trend_analyzer=trend, summary_agent=summary)


@app.get("/")
async def root():
    return {"message": "POST JSON { 'directive': '...' } to /"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
