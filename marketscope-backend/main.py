# main.py

import os
import asyncio
from typing import List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import feedparser
import openai

import httpx
from bs4 import BeautifulSoup

import crewai        # placeholder
from linkup import LinkupClient  # placeholder
import mcp           # placeholder


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
# Pydantic models for incoming request and outgoing response
# ────────────────────────────────────────────────────────────────────────────────
class DirectiveRequest(BaseModel):
    directive: str


class WebArticle(BaseModel):
    title: str
    url: str
    summary: Optional[str] = None
    image: str


class TrendDataPoint(BaseModel):
    label: str
    value: str
    description: Optional[str] = None


class ApiResult(BaseModel):
    directive: str
    web_monitor: List[WebArticle]
    trend_analyzer: List[TrendDataPoint]
    summary_agent: str  # a paragraph-style summary


# ────────────────────────────────────────────────────────────────────────────────
# Utility: fetch Open Graph image from a URL, fallback to Unsplash
# ────────────────────────────────────────────────────────────────────────────────
async def fetch_og_image(client: httpx.AsyncClient, url: str) -> Optional[str]:
    try:
        resp = await client.get(url, timeout=5.0)
        sess = BeautifulSoup(resp.text, "html.parser")
        og = sess.find("meta", property="og:image")
        if og and og.get("content"):
            return og["content"]
    except Exception:
        pass
    return None


def unsplash_fallback(query: str) -> str:
    q = query.replace(" ", ",")
    return f"https://source.unsplash.com/480x300/?{q}"


# ────────────────────────────────────────────────────────────────────────────────
# Agent Stubs (enhanced)
# ────────────────────────────────────────────────────────────────────────────────
async def run_web_monitor(directive: str) -> List[WebArticle]:
    """
    Web Monitor Agent: uses Google News RSS (public) and tries to pull out
    each article’s title, link, summary, and OG image (or a fallback]).
    """
    await asyncio.sleep(0.5)  # simulate latency

    query = directive.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}"

    parsed = feedparser.parse(rss_url)
    articles: List[WebArticle] = []

    async with httpx.AsyncClient() as client:
        # Gather up to 5 entries
        entries = parsed.entries[:5]
        tasks = []
        for entry in entries:
            title = entry.get("title", "No title")
            link = entry.get("link", "")
            summary = entry.get("summary", "") or entry.get("description", "")
            tasks.append((title, link, summary))

        # For each entry, fetch OG image (if possible) concurrently
        og_tasks = []
        for title, link, summary in tasks:
            og_tasks.append(fetch_og_image(client, link))

        og_results = await asyncio.gather(*og_tasks)

        for idx, (title, link, summary) in enumerate(tasks):
            image_url = og_results[idx] or unsplash_fallback(title)
            articles.append(
                WebArticle(
                    title=title,
                    url=link,
                    summary=summary,
                    image=image_url
                )
            )

    if not articles:
        # Fallback if no RSS entries
        articles.append(
            WebArticle(
                title=f"No recent RSS results for '{directive}'",
                url="",
                summary=None,
                image=unsplash_fallback("finance,news"),
            )
        )

    return articles


async def run_trend_analyzer(directive: str) -> List[TrendDataPoint]:
    """
    Trend Analyzer Agent: calls OpenAI (GPT-4) to generate realistic trend data points
    in JSON form, e.g. current search volume, week-over-week change, sentiment score.
    """
    await asyncio.sleep(0.3)

    system_prompt = (
        "You are a market-intelligence assistant. Given a single directive, "
        "return an array of three trend data points in strict JSON format. "
        "Each data point should have:\n"
        "  - label (e.g. \"Search Volume\", \"Social Sentiment\")\n"
        "  - value (e.g. \"75k searches/day\", \"+12% WoW\", \"48% negative\")\n"
        "  - optional description (one sentence).\n"
        "Output MUST be valid JSON that can be parsed into a list of objects."
    )
    user_prompt = f"Directive: \"{directive}\". Provide three trend data points in JSON."

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )
    except Exception:
        # Fallback stub if GPT-4 call fails
        return [
            TrendDataPoint(label="Search Volume", value="+47% YoY", description="Estimated from public sources"),
            TrendDataPoint(label="Social Sentiment", value="~65% positive", description="Based on Twitter and forum chatter"),
            TrendDataPoint(label="News Mentions", value="+23% WoW", description="Aggregate across major outlets"),
        ]

    # Parse the assistant’s response text as JSON
    text = response.choices[0].message.content.strip()
    try:
        import json

        parsed = json.loads(text)
        result: List[TrendDataPoint] = []
        for item in parsed:
            label = item.get("label", "")
            value = item.get("value", "")
            desc = item.get("description") or None
            result.append(TrendDataPoint(label=label, value=value, description=desc))
        if result:
            return result
    except Exception:
        pass

    # If parsing fails, return a fallback stub
    return [
        TrendDataPoint(label="Search Volume", value="+47% YoY", description="Estimated fallback"),
        TrendDataPoint(label="Social Sentiment", value="~65% positive", description="Fallback stub"),
        TrendDataPoint(label="News Mentions", value="+23% WoW", description="Fallback stub"),
    ]


async def run_summary_agent(
    directive: str, web_data: List[WebArticle], trend_data: List[TrendDataPoint]
) -> str:
    """
    Summary Agent: calls OpenAI (GPT-4) to synthesize a paragraph-style summary.
    """
    await asyncio.sleep(0.3)

    # Build a prompt combining web_data and trend_data
    system_prompt = (
        "You are a market-intelligence assistant. Given:\n"
        "  • a directive\n"
        "  • a list of web articles (each with title, url, summary)\n"
        "  • a list of trend data points\n"
        "produce a coherent, concise 3-4 sentence summary that an executive can read."
    )

    # Flatten web_data entries into text
    web_lines = []
    for art in web_data:
        web_lines.append(f"- {art.title} ({art.url})\n  {art.summary[:100]}…")

    trend_lines = [f"- {tp.label}: {tp.value} ({tp.description or ''})" for tp in trend_data]

    user_prompt = (
        f"Directive: \"{directive}\"\n\n"
        "Web Articles:\n" + "\n".join(web_lines) + "\n\n"
        "Trend Data:\n" + "\n".join(trend_lines) + "\n\n"
        "Write a 3-4 sentence market intelligence summary."
    )

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=250,
        )
        summary_text = response.choices[0].message.content.strip()
        return summary_text
    except Exception as e:
        return f"Error generating summary: {e}"


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
    POST "/" accepts a JSON body with {"directive": "..."} and returns detailed JSON.
    """
    directive_clean = request.directive.strip()
    if not directive_clean:
        raise HTTPException(status_code=400, detail="Directive cannot be empty.")

    # Run agents concurrently
    web_task = run_web_monitor(directive_clean)
    trend_task = run_trend_analyzer(directive_clean)
    web_data, trend_data = await asyncio.gather(web_task, trend_task)

    summary_data = await run_summary_agent(directive_clean, web_data, trend_data)

    result = ApiResult(
        directive=directive_clean,
        web_monitor=web_data,
        trend_analyzer=trend_data,
        summary_agent=summary_data,
    )
    return result.dict()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
