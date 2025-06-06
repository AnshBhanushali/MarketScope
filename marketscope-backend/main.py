# main.py

import os
import asyncio
from typing import List, Literal

import openai
import crewai
from linkup_sdk import LinkUpClient
from mcp import MCPClient


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ────────────────────────────────────────────────────────────────────────────────
# Configure SDK clients using environment variables
# ────────────────────────────────────────────────────────────────────────────────

# 1. OpenAI for LLM summarization
openai.api_key = os.getenv("OPENAI_API_KEY", "")

# 2. CrewAI for orchestrating multi-agent workflows (if needed)
CREWAI_API_KEY = os.getenv("CREWAI_API_KEY", "")
crew_client = crewai.Client(api_key=CREWAI_API_KEY)

# 3. LinkUp API client for job/hiring data
LINKUP_API_KEY = os.getenv("LINKUP_API_KEY", "")
linkup_client = LinkUpClient(api_key=LINKUP_API_KEY)

# 4. MCP SDK for sentiment/trend analytics
MCP_API_KEY = os.getenv("MCP_API_KEY", "")
mcp_client = MCPClient(api_key=MCP_API_KEY)

# ────────────────────────────────────────────────────────────────────────────────
# Pydantic models for request/response
# ────────────────────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    directive: str


class AgentResult(BaseModel):
    agentName: Literal["WebMonitor", "TrendAnalyzer", "SummaryAgent"]
    data: List[str]


class QueryResponse(BaseModel):
    results: List[AgentResult]
    combined: List[str]


# ────────────────────────────────────────────────────────────────────────────────
# Agent Implementations
# ────────────────────────────────────────────────────────────────────────────────

async def run_web_monitor(directive: str) -> List[str]:
    """
    Web Monitor Agent:
    - Uses LinkUpClient to fetch recent startup funding/hiring signals
    - Uses CrewAI (if desired) to orchestrate scraping of TechCrunch/Twitter
    """
    results: List[str] = []

    # 1) Query LinkUp for job postings related to directive
    try:
        jobs = linkup_client.search_jobs(keyword=directive, limit=3)
        for j in jobs:
            results.append(f"[WebMonitor] Job posting: {j['title']} at {j['company']} ({j['location']})")
    except Exception as e:
        results.append(f"[WebMonitor] LinkUp API error: {e}")

    # 2) Use CrewAI to dispatch a scraping workflow (hypothetical example)
    try:
        workflow = crew_client.create_workflow(
            name="techcrunch_scrape",
            prompt=f"Scrape TechCrunch for '{directive}' product launch announcements."
        )
        tc_results = workflow.run()
        for item in tc_results[:3]:
            results.append(f"[WebMonitor] TechCrunch: {item}")
    except Exception as e:
        results.append(f"[WebMonitor] CrewAI techcrunch error: {e}")

    # 3) (Optional) Use CrewAI to fetch tweets (hypothetical)
    try:
        twitter_workflow = crew_client.create_workflow(
            name="twitter_scrape",
            prompt=f"Fetch recent tweets mentioning '{directive}' from tech influencers."
        )
        tweet_results = twitter_workflow.run()
        for tweet in tweet_results[:3]:
            results.append(f"[WebMonitor] Twitter: {tweet}")
    except Exception:
        pass  # ignore if not configured

    if not results:
        results.append(f"[WebMonitor] No data found for '{directive}'.")
    return results


async def run_trend_analyzer(directive: str) -> List[str]:
    """
    Trend Analyzer Agent:
    - Uses MCPClient to detect sentiment and search interest trends
    - Optionally uses CrewAI to correlate stock or funding spikes
    """
    results: List[str] = []

    # 1) Get sentiment trends via MCP
    try:
        sentiment = mcp_client.get_sentiment_trends(topic=directive, timeframe="7d")
        results.append(f"[TrendAnalyzer] Sentiment trend (7d): {sentiment['trend_description']}")
    except Exception as e:
        results.append(f"[TrendAnalyzer] MCP sentiment error: {e}")

    # 2) Get search interest spikes via MCP
    try:
        spikes = mcp_client.get_search_spikes(keyword=directive, timeframe="30d")
        results.append(f"[TrendAnalyzer] Search interest spike: {spikes['spike_percent']}%")
    except Exception:
        pass  # optional

    # 3) Use CrewAI to detect funding spikes
    try:
        funding_workflow = crew_client.create_workflow(
            name="funding_spike_detection",
            prompt=f"Analyze funding announcements for companies related to '{directive}' in the last month."
        )
        fund_results = funding_workflow.run()
        for f in fund_results[:2]:
            results.append(f"[TrendAnalyzer] Funding: {f}")
    except Exception:
        pass

    if not results:
        results.append(f"[TrendAnalyzer] No trends found for '{directive}'.")
    return results


async def run_summary_agent(
    directive: str, web_data: List[str], trend_data: List[str]
) -> List[str]:
    """
    Summary Agent:
    - Uses OpenAI ChatCompletion to synthesize a concise intelligence briefing.
    """
    # Build a combined prompt
    combined_text = "\n".join(web_data + trend_data)
    prompt = (
        f"Directive: {directive}\n\n"
        f"Raw data:\n{combined_text}\n\n"
        "Please produce a concise, bullet-point competitive intelligence summary."
    )

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a market intelligence assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        # Split the assistant’s reply into bullet lines
        summary_text = response.choices[0].message.content.strip()
        return [line for line in summary_text.split("\n") if line.strip()]
    except Exception as e:
        return [f"[SummaryAgent] OpenAI error: {e}"]


# ────────────────────────────────────────────────────────────────────────────────
# FastAPI Application & Routes
# ────────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="MarketScope Multi‐Agent API",
    description="Orchestrates WebMonitor, TrendAnalyzer, and SummaryAgent using OpenAI, CrewAI, LinkUp, and MCP",
    version="1.0.0",
)


@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    directive = request.directive.strip()
    if not directive:
        raise HTTPException(status_code=400, detail="Directive cannot be empty.")

    # 1) Launch WebMonitor and TrendAnalyzer in parallel
    web_task = run_web_monitor(directive)
    trend_task = run_trend_analyzer(directive)
    web_data, trend_data = await asyncio.gather(web_task, trend_task)

    # Wrap results
    web_result = AgentResult(agentName="WebMonitor", data=web_data)
    trend_result = AgentResult(agentName="TrendAnalyzer", data=trend_data)

    # 2) Run SummaryAgent after WebMonitor & TrendAnalyzer finish
    summary_data = await run_summary_agent(directive, web_data, trend_data)
    summary_result = AgentResult(agentName="SummaryAgent", data=summary_data)

    # 3) Combined bullet points
    combined_report = web_data + trend_data + summary_data

    return QueryResponse(results=[web_result, trend_result, summary_result], combined=combined_report)


# ────────────────────────────────────────────────────────────────────────────────
# Run application
# ────────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
