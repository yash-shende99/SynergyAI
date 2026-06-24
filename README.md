<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=SynergyAI" alt="SynergyAI Logo" width="120" />

  # ⚡ SynergyAI
  
  **The Next-Generation M&A Deal Sourcing & AI Intelligence Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
  [![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=flat-square&logo=redis)](https://redis.io/)
  [![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-white?style=flat-square)](https://ollama.ai/)
</div>

---

## 🌟 Overview

**SynergyAI** is an enterprise-grade Mergers and Acquisitions (M&A) platform designed to automate deal sourcing, streamline due diligence, and generate deep financial intelligence using cutting-edge AI. 

Built with an unrelenting focus on performance, SynergyAI leverages **Local LLMs (via Ollama)**, **RAG (Retrieval-Augmented Generation)**, and an aggressive **"Hover-to-Predict" caching architecture** to deliver sub-second UI rendering while processing immensely complex financial workflows in the background.

---

## 🚀 Key Features

### 🧠 Intelligent Deal Sourcing & Screening
- **Strategic Match Engine:** Source targets by revenue, geography, and strategic goals using natural language queries.
- **Server-Sent Events (SSE):** Watch the AI evaluate hundreds of target companies in real-time.

### 📊 Mission Control Dashboard
- **Live Deal Pipeline:** Kanban-style tracking for active M&A targets.
- **AI-Powered Synergy & Risk Scoring:** Automated breakdown of strategic fit, financial synergy, and critical risk factors.
- **Corporate Knowledge Graph:** Visual relationship mapping of parent companies, subsidiaries, executives, and competitors.

### 📑 VDR (Virtual Data Room) Intelligence
- **RAG-Powered Semantic Search:** Chat directly with your documents. Uses `FAISS` and `SentenceTransformers` to search gigabytes of VDR files instantly.
- **Smart Annotations:** AI automatically flags clauses, extracts themes, and summarizes complex contracts.

### 💼 One-Click Investment Memos
- Generate comprehensive investment memos (Executive Summary, Valuation, Synergy, Risk) across all deal dimensions with a single click.
- Leverages `asyncio.gather()` to query parallel LLM pipelines concurrently for massive speed gains.

### ⚡ Lightning-Fast Architecture
- **"Hover-to-Predict" Cache Warming:** The absolute millisecond a user hovers over a project, the backend begins pre-computing heavy LLM tasks and stores them in **Redis**. 
- **OOM Protection:** Graceful degradation fallbacks specifically engineered for VRAM-constrained parallel LLM environments.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Framework:** Next.js 15 (App Router)
- **UI & Styling:** React, Tailwind CSS, Shadcn UI, Lucide Icons
- **State Management:** Custom React Hooks (`useEnhancedCache`)
- **Data Visualization:** ECharts, Recharts

### Backend (Server-Side)
- **Framework:** FastAPI (Python 3.10+)
- **Concurrency:** `asyncio`, `httpx`
- **Database:** Supabase (PostgreSQL with pgvector)
- **Caching Layer:** Redis (Dynamic TTLs, Cache Invalidators)
- **Task Scheduling:** APScheduler (Background Cache Warming)

### AI & Machine Learning
- **LLM Engine:** Ollama (Local/Self-Hosted Models)
- **Vector Search:** FAISS (Facebook AI Similarity Search)
- **Embeddings:** `BAAI/bge-small-en-v1.5` via `sentence-transformers`
- **Data Processing:** NumPy, Pandas, ReportLab (PDF Generation)

---

## 🏗️ Architecture Highlight: "Zero-Latency" LLM Generation

One of the core challenges of AI applications is the latency associated with generating complex outputs. SynergyAI solves this using a multi-tiered approach:
1. **Parallel Execution:** Endpoints simultaneously fire 5+ prompts to Ollama utilizing `OLLAMA_NUM_PARALLEL` batching.
2. **Aggressive Prefetching:** The UI intercepts `onMouseEnter` events on project cards, pinging a `/prefetch` endpoint that initiates background AI tasks before the user even navigates to the page.
3. **Redis Smart Caching:** Finalized JSON payloads are serialized and cached in Redis. By the time the user clicks, the complex 15-second generation has already resolved into a 15-millisecond cache hit.

---

## 💻 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- Redis Server
- [Ollama](https://ollama.ai/) installed locally
- Supabase Account

### 1. Setup the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Redis locally
redis-server

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Setup the AI Engine
```bash
# Set parallel processing based on your VRAM
export OLLAMA_NUM_PARALLEL=2  # On Windows PowerShell: $env:OLLAMA_NUM_PARALLEL="2"

# Start the Ollama server and load your model
ollama serve
ollama run synergyai-specialist
```

### 3. Setup the Frontend
```bash
# In the root directory
npm install

# Setup your .env.local variables
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.
