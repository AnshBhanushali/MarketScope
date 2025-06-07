# MarketScope 🧠📊

MarketScope is an AI-powered market intelligence web app that uses multiple AI agents to analyze trends, summarize web content, and provide insightful summaries. It integrates a beautiful frontend with a FastAPI backend, OpenAI for AI processing, and ChromaDB for vector storage.

<img width="654" alt="Screenshot 2025-06-06 at 10 00 10 PM" src="https://github.com/user-attachments/assets/a90da7a3-5e00-4d35-ab5d-c719ae42bf6c" />

---

## 🔧 Tech Stack

* Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons
* Backend: FastAPI (Python), Uvicorn
* AI/Infra: OpenAI API (GPT-4), ChromaDB
* Deployment: Render (backend), Vercel (frontend)

---

## ⚙️ Project Structure

MarketScope/

* marketscope-frontend/ — Frontend folder (Next.js)
* marketscope-backend/ — Backend folder (FastAPI)

* .env.local — Contains NEXT\_PUBLIC\_API\_URL for frontend

---

## 🚀 Local Development

1. Clone the repository
2. Start backend:

   * Go to `marketscope-backend`
   * Set up virtual environment
   * Install requirements
   * Run using `uvicorn main:app --host 0.0.0.0 --port 8000`
3. Start frontend:

   * Go to `marketscope-frontend`
   * Run `npm install`
   * Create `.env.local` with:
     NEXT\_PUBLIC\_API\_URL=[http://localhost:8000](http://localhost:8000)
   * Run `npm run dev`

---

## 🌍 Deployment

Backend on Render:

* Root Directory: marketscope-backend
* Build Command: pip install -r requirements.txt
* Start Command: uvicorn main\:app --host 0.0.0.0 --port 8000
* Add your `OPENAI_API_KEY` in Render's environment variables

Frontend on Vercel:

* Root Directory: marketscope-frontend
* Environment Variable:
  NEXT\_PUBLIC\_API\_URL=https\://<your-backend-url>.onrender.com

---

## ✨ Features

* Real-time AI-powered analysis of market trends
* Headline scraping with links and thumbnails
* Sparkline visualizations of interest over time
* Natural language summaries powered by GPT
* Stylish UI inspired by metaverse aesthetic

---

## ✅ Future Enhancements

* OAuth login
* Saved searches and user dashboards
* PDF/document uploads for custom analysis
* RAG-based querying and citation system
<img width="654" alt="Screenshot 2025-06-06 at 10 00 10 PM" src="https://github.com/user-attachments/assets/a90da7a3-5e00-4d35-ab5d-c719ae42bf6c" />

