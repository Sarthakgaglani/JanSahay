# JanSahay AI
## Government Scheme Assistant

*Full Project Design Document — Agent-Ready Edition*

---

| Field | Details |
|---|---|
| Project Type | Portfolio Project (Open Source) |
| Budget | Rs. 0 — 100% Free Tier Stack |
| Primary LLM | Google Gemini 1.5 Flash (Free API Tier) |
| Target Users | Indian Citizens — All Literacy Levels |
| Languages | Hindi, English, Gujarati, Tamil, Telugu, Bengali, Marathi |
| Login Required | No — Fully Public, No Signup / No Login |
| Version | v1.0 — July 2025 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Target Data Sources (6 Government Portals)](#4-target-data-sources--6-government-portals)
5. [Why No Login / Signup — Design Decision](#5-why-no-login--signup--design-decision)
6. [Pages & UI Structure (including Dashboard)](#6-pages--ui-structure)
7. [Full Technical Architecture](#7-full-technical-architecture)
8. [Tech Stack — 100% Free Tier](#8-tech-stack--100-free-tier)
9. [Free Deployment Plan](#9-free-deployment-plan)
10. [SEO Strategy](#10-seo-strategy--search-engine-friendly)
11. [Responsive Design Guidelines](#11-responsive-design-guidelines)
12. [Data Pipeline — Step by Step](#12-data-pipeline--step-by-step)
13. [Agent Build Instructions — Step by Step](#13-agent-build-instructions--step-by-step)
14. [Development Roadmap with Timeline](#14-development-roadmap-with-timeline)
15. [Best Practices & Disclaimers](#15-best-practices--disclaimers)
16. [Challenges & Solutions](#16-challenges--solutions)
17. [Future Scope](#17-future-scope)

---

## 1. Executive Summary

JanSahay AI is a zero-cost, AI-powered web platform that helps Indian citizens discover government schemes, check their eligibility, understand required documents, and get step-by-step guidance — all in their own language, on any device, without creating an account.

The platform uses Retrieval-Augmented Generation (RAG) to fetch accurate, cited information from official government portals and delivers it through a fast, conversational interface. No misinformation. No hallucination. Every answer is linked back to the official source.

> **Core Belief:** A farmer in Rajasthan, a daily-wage worker in Mumbai, and a student in Bihar should be able to find the right government scheme in under 60 seconds — in their language — on a basic smartphone.

---

## 2. Problem Statement

India has 1000+ central and state government schemes. But:

- Citizens do not know which schemes exist or apply to them
- Government portals are complex, English-heavy, and have poor UX
- Eligibility criteria are buried in long PDFs with legal language
- Required documents differ scheme-to-scheme and are not clearly listed
- Application steps are spread across multiple portals
- Rural and elderly users cannot navigate digital portals independently
- Searching on Google returns outdated blog posts, not official info

**Result:** Crores of eligible citizens miss out on schemes they are legally entitled to.

---

## 3. Solution Overview

JanSahay AI solves this by:

- Crawling official government portals and storing scheme data in a vector database
- Using RAG + Google Gemini API to answer questions with grounded, cited responses
- Supporting 7 Indian languages with voice input and output
- Providing a clean, simple UI that works on basic Android smartphones
- Requiring zero login — open the website and start asking questions immediately
- Always linking users to the official government portal for final applications

---

## 4. Target Data Sources — 6 Government Portals

These 6 portals are chosen because they cover the highest-impact schemes and are the most confusing for average citizens to navigate directly.

### Portal 1: MyScheme.gov.in

- **URL:** https://www.myscheme.gov.in
- **Why chosen:** India's official scheme discovery portal — 1,000+ schemes indexed across all categories
- **User difficulty:** Complex filters; users don't know which category or state to select
- **What to crawl:** Scheme names, descriptions, eligibility rules, document checklist, application links

### Portal 2: PM-KISAN (pmkisan.gov.in)

- **URL:** https://pmkisan.gov.in
- **Why chosen:** One of the largest direct-benefit schemes — 11 crore+ farmers enrolled
- **User difficulty:** Farmers don't know eligibility rules, how to add land records, or how to check payment status
- **What to crawl:** Eligibility criteria, documents needed, status check process, frequently asked questions

### Portal 3: Ayushman Bharat / PMJAY (pmjay.gov.in)

- **URL:** https://pmjay.gov.in
- **Why chosen:** Health cover for 55 crore people — most users don't know if their family qualifies
- **User difficulty:** How to check coverage, which hospitals are empanelled, how to use the golden card
- **What to crawl:** Eligibility check steps, empanelled hospitals process, golden card process, covered treatments

### Portal 4: National Scholarship Portal (scholarships.gov.in)

- **URL:** https://scholarships.gov.in
- **Why chosen:** Students miss deadlines and don't know which scholarship to apply for
- **User difficulty:** Too many overlapping scholarships; income/caste eligibility is confusing
- **What to crawl:** Scholarship names, eligible classes and categories, amount, deadlines, required documents

### Portal 5: eSHRAM (eshram.gov.in)

- **URL:** https://eshram.gov.in
- **Why chosen:** Portal for 38 crore unorganised workers — very low awareness among target group
- **User difficulty:** Workers don't know they qualify or what benefits they get after registration
- **What to crawl:** Registration steps, benefits, linked schemes, accident insurance details, documents required

### Portal 6: Jan Dhan Yojana (pmjdy.gov.in)

- **URL:** https://pmjdy.gov.in
- **Why chosen:** Core financial inclusion scheme — linked to Aadhaar, DBT, and insurance
- **User difficulty:** People don't understand overdraft facility, free insurance, and RuPay card benefits
- **What to crawl:** Account benefits, linked schemes, how to open account, overdraft details, insurance coverage

---

## 5. Why No Login / Signup — Design Decision

This is a deliberate, mission-critical design choice. Here is the full reasoning:

**Who are our users?**
- Elderly citizens who have never created an online account
- Daily-wage workers accessing the site on a shared phone
- Farmers in low-connectivity rural areas with limited screen time
- People who distrust giving personal data to unknown websites

**Why login/signup would hurt this project:**
- Adds a barrier before the user receives any value
- Many users do not have an email ID or cannot remember passwords
- OTP-based login requires reliable mobile network — not always available in rural India
- Increases drop-off rate dramatically on first visit
- Creates unnecessary data privacy obligations under IT Act

**What we do instead:**
- Session-based anonymous usage — no personal data stored on the server
- Browser localStorage saves recent searches on the user's device only
- No personal data collected, no tracking cookies
- Users can bookmark scheme pages and return directly

> **Final Decision:** JanSahay AI is and will remain fully public. Open the URL — start using. Just like Google Search.

---

## 6. Pages & UI Structure

The following pages make up the complete frontend. There is no personal dashboard (no login). A public statistics panel is embedded in the homepage to show project impact.

### Page 1: Home Page (`/`)

- Hero section: "Apni Bhasha Mein Sarkari Yojana Khojein" (Find Government Schemes in Your Language)
- Large search bar with voice input button as the primary call-to-action
- Language selector at top — users pick their preferred language immediately
- **PUBLIC STATS PANEL** (embedded on homepage, not a separate page):
  - Total Schemes Indexed: [count]
  - Government Portals Covered: 6
  - Languages Supported: 7
- Category cards: Agriculture, Health, Education, Housing, Women, Workers, Finance
- Featured Schemes section (4–6 most searched schemes)
- "How It Works" — 3 steps: Ask → Get Answer → Apply on Official Portal
- Footer: About, Disclaimer, GitHub, Source portals list

### Page 2: Chat / Ask AI (`/chat`)

- Full-page conversational interface
- Auto-submits query if coming from home page search
- Voice input button (Web Speech API — browser built-in, free)
- Language selector in header
- Each response shows: Answer text + Source portal badge + Official apply button
- Follow-up question input at bottom — multi-turn conversation in session
- Share answer button (copies URL with query param)
- Thumbs up / down feedback (anonymous, logged for improvement)

### Page 3: Browse Schemes (`/schemes`)

- Filter panel: Category, State, Age group, Income level, Gender, Caste group
- Responsive card grid — 1 col mobile, 2 col tablet, 3 col desktop
- Each card: Scheme name + 1-line summary + Portal badge + "Know More" button
- Search bar to filter by scheme name
- Pagination with 20 schemes per page

### Page 4: Scheme Detail (`/schemes/[slug]`)

- Full scheme information: What it is, Who qualifies, Documents needed, How to apply
- Step-by-step numbered application guide
- Primary CTA button: "Apply on Official Portal" (opens in new tab)
- Share scheme button
- Related schemes at the bottom
- SEO-optimized: unique title, meta description, FAQ Schema, HowTo Schema

### Page 5: About (`/about`)

- Project mission and creator details
- GitHub repository link
- List of all 6 data sources with last crawl date
- Legal disclaimer: "Not affiliated with Government of India"

### Note on Admin Dashboard

An admin dashboard (protected route, not public) is recommended as a future feature for monitoring crawler health, query volume, and error logs. For v1.0 of this portfolio project, this is **NOT needed**. Add it in v2.0 if the project gets real users.

---

## 7. Full Technical Architecture

### A. Data Pipeline (runs offline on schedule)

```
Official Gov Portals
  → Playwright/BS4 Crawler
  → HTML + PDF Parser
  → Text Cleaner
  → Chunker
  → Sentence Transformer Embeddings
  → FAISS Vector Index
  → Saved to Disk
```

### B. Query Pipeline (real-time per user request)

```
User Question
  → Language Detection
  → Translate to English (if needed)
  → Embed Query
  → FAISS Search (Top 5 Chunks)
  → Build Prompt
  → Gemini 1.5 Flash API
  → Response
  → Translate back to user language
  → Return with Source URLs
  → Frontend Display
```

### C. Component Map

| Component | Technology |
|---|---|
| Frontend | React 18 + Vite (Vercel) |
| Backend API | FastAPI + Uvicorn (Render) |
| Vector Database | FAISS (loaded in memory at startup) |
| Embedding Model | sentence-transformers/all-MiniLM-L6-v2 (free, runs locally) |
| LLM | Google Gemini 1.5 Flash (Free API — 15 RPM, 1M tokens/day) |
| Web Crawler | Playwright + BeautifulSoup4 |
| PDF Parser | pdfplumber + PyPDF2 |
| Scheduler | APScheduler (weekly re-crawl via GitHub Actions) |
| Translation | IndicTrans2 (open source) or googletrans library |
| Voice Input | Web Speech API (browser native — completely free) |
| Voice Output | SpeechSynthesis API (browser native — completely free) |
| Database | SQLite (dev) / PostgreSQL free tier on Render (prod) |
| SEO | React Helmet Async + JSON-LD Schema markup |
| CI/CD | GitHub Actions (free 2000 min/month) |

---

## 8. Tech Stack — 100% Free Tier

### Frontend Dependencies

- **React 18 + Vite** — fast modern build tool
- **Tailwind CSS** — utility-first responsive styling
- **React Router v6** — client-side page routing
- **React Helmet Async** — dynamic SEO meta tags per page
- **Axios** — HTTP calls to FastAPI backend
- **Web Speech API** — voice input (built into Chrome and Firefox)
- **SpeechSynthesis API** — voice output (built into browser)

### Backend Dependencies (`requirements.txt`)

- `fastapi` — async REST API framework
- `uvicorn` — ASGI server for FastAPI
- `langchain` — RAG orchestration and prompt management
- `faiss-cpu` — vector similarity search (runs in memory)
- `sentence-transformers` — embedding model (local, no API cost)
- `google-generativeai` — official Gemini API Python client
- `playwright` — JavaScript-rendered page crawling
- `beautifulsoup4` — HTML parsing
- `pdfplumber` — PDF text extraction
- `apscheduler` — background job scheduling
- `sqlalchemy` — ORM for PostgreSQL/SQLite
- `python-dotenv` — environment variable management

### Gemini API Free Tier Limits

| Model | Free Limits |
|---|---|
| **Gemini 1.5 Flash** | 15 requests/minute, 1 million tokens/day — **USE THIS** |
| Gemini 1.5 Pro | 2 requests/minute, 50K tokens/day — too slow for this project |

> Use Gemini 1.5 Flash for all user queries. It is fast, free, and more than sufficient for RAG-based factual responses with 5 context chunks.

---

## 9. Free Deployment Plan

| Service | Platform & Free Plan Details |
|---|---|
| React Frontend | Vercel — Free Hobby Plan. Unlimited static deploys. Auto-deploy on git push. |
| FastAPI Backend | Render — Free Web Service. Spins down after 15 min inactivity (see note below). |
| PostgreSQL Database | Render — Free PostgreSQL. 1GB storage, 90-day retention. |
| FAISS Vector Index | Stored as `faiss_index.bin` file in the backend. Loaded into memory on startup. |
| Weekly Crawler | GitHub Actions — runs cron job. Free 2000 minutes/month is more than enough. |
| Domain & SSL | Vercel provides free subdomain: `jansahay.vercel.app`. SSL is automatic. |
| CI/CD Pipeline | GitHub Actions — push to main branch auto-deploys both frontend and backend. |

> **⚠️ Important: Render Free Tier Cold Start**
> - Free web services on Render sleep after 15 minutes of no traffic
> - First request after sleeping takes approximately 30 seconds to respond
> - **Fix:** Add a loading spinner on frontend with text "Connecting, please wait..."
> - **Alternative:** Use Railway.app free tier — stays warm longer than Render

### Deployment Steps in Order

1. Push all code to GitHub (main branch)
2. Connect GitHub repo to Render — create new Web Service for `backend/`
3. Add environment variables in Render: `GEMINI_API_KEY`, `DATABASE_URL`
4. Connect GitHub repo to Vercel — create new project for `frontend/`
5. Add environment variable in Vercel: `VITE_API_URL=https://your-backend.onrender.com`
6. Create GitHub Actions workflow for weekly crawler (see Section 13)
7. Submit `sitemap.xml` to Google Search Console (free)

---

## 10. SEO Strategy — Search Engine Friendly

Good SEO ensures real citizens can find JanSahay through Google when they search for scheme-related queries. This is also a strong portfolio signal.

### On-Page SEO (every page)

- Unique `<title>` for every page — set via React Helmet Async
- Example: `"PM-KISAN Scheme — Eligibility, Documents, How to Apply | JanSahay"`
- Unique `<meta name="description">` per page — 150–160 characters
- Keyword-rich H1, H2, H3 headings on every page
- Alt text on all images and icons
- Canonical URL tag to avoid duplicate content issues
- Internal links between related scheme pages

### Structured Data / Schema Markup (JSON-LD)

- **FAQ Schema** on all scheme detail pages — Google shows these as rich snippets in search results
- **HowTo Schema** for application step-by-step guides
- **Organization Schema** on homepage
- **BreadcrumbList Schema** for navigation trail

### Technical SEO

- `sitemap.xml` — auto-generated from all scheme slugs, submitted to Google Search Console
- `robots.txt` — allow all search engine crawlers
- Target page load < 3 seconds (use Lighthouse in Chrome to test)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- All important content visible without JavaScript (use React Helmet for critical meta)

### Target Search Keywords

- "government schemes for farmers India 2025"
- "PM-KISAN eligibility documents required"
- "Ayushman Bharat card kaise banaye"
- "scholarship for SC ST students India"
- "eSHRAM card benefits unorganised workers"
- "Jan Dhan Yojana account opening documents"

---

## 11. Responsive Design Guidelines

The majority of JanSahay users will access it on basic Android smartphones with small screens and slow internet. Mobile-first design is mandatory, not optional.

| Screen Size | Layout Rules |
|---|---|
| Mobile (below 640px) | Single column. Large tap targets (minimum 44×44px). Bottom navigation bar. Full-screen chat. |
| Tablet (640px to 1024px) | Two column scheme grid. Side filter panel. Larger font sizes. |
| Desktop (above 1024px) | Three column grid. Persistent sidebar for filters. Wider chat window with scheme cards. |

### Mobile-Specific Requirements

- Minimum font size: **16px** everywhere (no tiny text that strains eyes)
- All buttons: minimum **44×44px** tap target
- Voice search button: large and always visible on mobile
- Language selector: prominent at top of every page
- Scheme cards on mobile: show only Name + 1 line summary + button (no clutter)
- Chat interface: full screen on mobile, no sidebars
- Zero horizontal scrolling on any screen size
- Test on Chrome DevTools at 375px (iPhone SE) and 412px (Android mid-range)

---

## 12. Data Pipeline — Step by Step

### Step 1: Crawl Official Portals

- Use Playwright for JavaScript-rendered pages (MyScheme, PMJAY)
- Use BeautifulSoup4 for static HTML pages (PM-KISAN, eSHRAM, PMJDY)
- Download all linked PDFs using Python `requests` library
- Respect `robots.txt` — only crawl public, non-authenticated pages
- Store raw output in `/data/raw/[portal-name]/` with source URL in metadata
- Run on startup and weekly via GitHub Actions cron job

### Step 2: Parse and Extract Structured Data

- Remove HTML tags, navigation menus, headers, footers using BeautifulSoup4
- Extract structured fields: Scheme Name, Description, Eligibility, Documents, Steps, Official URL
- For PDFs: extract text page by page using pdfplumber
- For scanned PDFs: fall back to Tesseract OCR (pytesseract)
- Normalize whitespace, remove duplicate lines, remove boilerplate text
- Save each scheme as a JSON object to `/data/cleaned/[portal-name]/[slug].json`

### Step 3: Chunk the Text

- Load all cleaned JSON files
- Split text into chunks of 500 tokens with 50-token overlap using LangChain `RecursiveCharacterTextSplitter`
- Overlap ensures no important sentence is cut between two chunks
- Each chunk must carry metadata: `{source_url, scheme_name, portal_name, section_name, chunk_id}`
- Save all chunks to `/data/chunks/all_chunks.json`
- Log total chunk count — expect 5,000 to 20,000 chunks for 6 portals

### Step 4: Generate Embeddings

- Load `sentence-transformers/all-MiniLM-L6-v2` — runs locally, no API key needed, completely free
- Embed every chunk: `embeddings = model.encode([chunk["text"] for chunk in chunks])`
- Each embedding is a 384-dimensional vector
- One-time computation per crawl cycle — takes 5–15 minutes on first run
- Save numpy array to `/data/embeddings/embeddings.npy`

### Step 5: Build FAISS Vector Index

```python
import faiss
import numpy as np

index = faiss.IndexFlatL2(384)
index.add(np.array(embeddings).astype("float32"))
faiss.write_index(index, "data/vectordb/faiss_index.bin")
json.dump(chunks, open("data/vectordb/metadata.json", "w"))
```

- Commit both files to GitHub — typically under 50MB for this project

---

## 13. Agent Build Instructions — Step by Step

> This section is written specifically for an AI coding agent. Follow all steps in order. Do not skip any step. Each step has clear inputs, actions, and expected outputs. **Complete one step fully before moving to the next.**

---

### PHASE 0: Project Setup

#### Step 0: Initialize Project Structure

- Create root folder: `jansahay-ai/`
- Create subfolders: `frontend/`, `backend/`, `crawler/`, `data/raw/`, `data/cleaned/`, `data/chunks/`, `data/vectordb/`, `scripts/`, `.github/workflows/`
- Run: `git init && git remote add origin https://github.com/[your-username]/jansahay-ai.git`
- Create `backend/.env` with: `GEMINI_API_KEY=your_gemini_api_key_here`
- Create `backend/requirements.txt` (list all packages from Section 8)
- Initialize frontend: `cd frontend && npm create vite@latest . -- --template react`
- Install Tailwind: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- Create `.gitignore`: add `.env`, `__pycache__`, `node_modules`, `data/raw/`, `*.bin`

---

### PHASE 1: Build the Crawlers

#### Step 1: Create `crawler/crawl_myscheme.py`

- Import: `from playwright.sync_api import sync_playwright`, `from bs4 import BeautifulSoup`, `import json, os`
- Function `crawl_myscheme()`: open browser, navigate to `https://www.myscheme.gov.in/schemes`
- Wait for scheme cards to load, scroll to bottom to trigger lazy loading
- For each scheme card: extract name and detail page URL
- Navigate to each detail page: extract eligibility, documents, application URL, description
- Save each scheme to `data/raw/myscheme/[scheme-slug].json` with fields: `name, description, eligibility, documents, application_url, source_url, crawled_at`
- Expected output: 400–600 JSON files

#### Step 2: Create `crawler/crawl_pmkisan.py`

- Target: `https://pmkisan.gov.in`
- Extract: scheme overview page, eligibility section, documents required section, FAQ page
- Download any linked PDF guidelines using `requests` library
- Extract PDF text using `pdfplumber`
- Save to `data/raw/pmkisan/` as structured JSON

#### Step 3: Repeat Crawlers for Remaining 4 Portals

- `crawler/crawl_pmjay.py` → `data/raw/pmjay/`
- `crawler/crawl_scholarships.py` → `data/raw/scholarships/`
- `crawler/crawl_eshram.py` → `data/raw/eshram/`
- `crawler/crawl_pmjdy.py` → `data/raw/pmjdy/`
- Create `crawler/run_all.py` that imports and runs all 6 crawlers sequentially
- Add `try/except` around each crawler so one failure does not stop others
- Log crawl results to `data/crawl_log.json`: `{portal, status, items_crawled, timestamp}`

---

### PHASE 2: Parse, Chunk, Embed

#### Step 4: Create `scripts/parse_and_chunk.py`

- Read all JSON files from all `data/raw/` subfolders
- Clean each text field: strip HTML tags, normalize whitespace, remove empty lines
- Initialize: `from langchain.text_splitter import RecursiveCharacterTextSplitter`
- `splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`
- For each scheme: split description + eligibility + documents + steps into chunks
- Each chunk object must have: `{text, source_url, scheme_name, portal, section, chunk_id}`
- Save all chunks to `data/chunks/all_chunks.json`
- Print total chunks created at the end

#### Step 5: Create `scripts/embed_and_index.py`

```python
from sentence_transformers import SentenceTransformer
import faiss, numpy as np, json

model = SentenceTransformer("all-MiniLM-L6-v2")
chunks = json.load(open("data/chunks/all_chunks.json"))
embeddings = model.encode([c["text"] for c in chunks], show_progress_bar=True)

index = faiss.IndexFlatL2(384)
index.add(np.array(embeddings).astype("float32"))
faiss.write_index(index, "data/vectordb/faiss_index.bin")
json.dump(chunks, open("data/vectordb/metadata.json", "w"))

print(f"Indexed {len(chunks)} chunks successfully")
```

---

### PHASE 3: Build FastAPI Backend

#### Step 6: Create `backend/main.py` — App Setup

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JanSahay AI API")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://jansahay.vercel.app"],
    allow_methods=["*"], allow_headers=["*"]
)
```

- On startup event: load `faiss_index.bin` and `metadata.json` into global variables
- Load sentence transformer model into global variable on startup
- Load `GEMINI_API_KEY` from `.env` using `python-dotenv`
- Add route: `GET /` → return `{"status": "ok", "message": "JanSahay API running"}`

#### Step 7: Create `backend/rag.py` — Core RAG Function

```python
async def query_rag(question: str, language: str = "en") -> dict:
    # STEP A: Translate to English if needed
    # STEP B: embed_query = model.encode([question])
    # STEP C: distances, indices = faiss_index.search(embed_query, k=5)
    # STEP D: Retrieve top 5 chunks from metadata using indices
    # STEP E: Build context string from retrieved chunks
    # STEP F: Build prompt (see below)
    # STEP G: Call Gemini 1.5 Flash
    # STEP H: Extract answer_text = response.text
    # STEP I: Translate answer back if needed
    # STEP J: Return answer + sources
```

**Prompt template:**
```
You are JanSahay AI, a helpful assistant for Indian government schemes.
Answer ONLY based on the context below.
If the context does not have the answer, say:
"I could not find this information. Please visit the official portal."
Always mention the official URL.

Context: [context]
Question: [question]

Provide a clear, simple answer.
```

**Return format:**
```json
{
  "answer": "...",
  "sources": [
    {"name": "scheme_name", "portal": "portal_name", "url": "source_url"}
  ],
  "language": "hi"
}
```

#### Step 8: Create `backend/routes.py` — All API Routes

| Route | Method | Body / Params | Returns |
|---|---|---|---|
| `/api/chat` | POST | `{question: str, language: str}` | Answer + sources |
| `/api/schemes` | GET | `?category=&state=&page=&limit=` | Paginated scheme list |
| `/api/schemes/{slug}` | GET | — | Full scheme details |
| `/api/stats` | GET | — | `{schemes_count, portals_count, languages_count}` |
| `/api/feedback` | POST | `{question: str, helpful: bool}` | Logged to DB |

---

### PHASE 4: Build React Frontend

#### Step 9: Set Up `frontend/src/App.jsx`

```bash
npm install react-router-dom axios react-helmet-async
```

- Set up `BrowserRouter` with routes: `/` (Home), `/chat` (Chat), `/schemes` (Schemes), `/schemes/:slug` (Detail), `/about` (About)
- Create `Navbar.jsx`: Logo + Language Selector + "Browse Schemes" link + GitHub link
- Create `Footer.jsx`: Disclaimer text + source portals list + creator credit
- Create `LanguageContext.jsx`: React context for selected language across all pages
- Create `api.js`: axios instance with `baseURL` from `VITE_API_URL` env variable

#### Step 10: Build `pages/Home.jsx`

- Full-page hero with heading and sub-heading (translate based on selected language)
- `SearchBar` component: text input + microphone button + submit

```js
// Mic button
const recognition = new window.SpeechRecognition();
recognition.start();
recognition.onresult = (e) => setQuery(e.results[0][0].transcript);
```

- On form submit: `navigate("/chat?q=" + encodeURIComponent(query))`
- `StatsBar`: `useEffect` to fetch `/api/stats` on mount, display as 3 stat cards
- `CategoryGrid`: 7 clickable category cards → `/schemes?category=agriculture` etc.
- `HowItWorks`: 3 steps with icons (1. Ask → 2. Get Answer → 3. Apply Official)

#### Step 11: Build `pages/Chat.jsx`

- On mount: read query from URL params using `useSearchParams`
- If query exists in URL: automatically call `POST /api/chat` with that query
- Display loading spinner while API call is in progress (show "Thinking..." text)
- Render response: answer paragraph + source cards (scheme name + portal + Official Apply button)
- Input at bottom for follow-up questions — maintains `messages` array in state
- Voice output: `window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer))`
- Thumbs up/down buttons: on click, call `POST /api/feedback`
- Messages never sent to server after session ends — no user data stored

#### Step 12: Build `pages/Schemes.jsx` and `pages/SchemeDetail.jsx`

**Schemes.jsx:**
- Fetch from `GET /api/schemes` with filter params, display in responsive grid
- Use URL query params for filters so filtered views are shareable/bookmarkable

**SchemeDetail.jsx:**
- Fetch from `GET /api/schemes/:slug`
- Display all scheme fields with clear headings
- Numbered steps for application process
- Add React Helmet:
```jsx
<title>{scheme.name} — Eligibility, Documents, Apply | JanSahay</title>
```
- Add FAQ schema JSON-LD in `<script type="application/ld+json">` tag
- Add HowTo schema for application steps

---

### PHASE 5: Deploy to Production

#### Step 13: Deploy FastAPI Backend to Render

1. Go to [render.com](https://render.com), create free account
2. New → Web Service → Connect GitHub repo
3. Root directory: `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `GEMINI_API_KEY` (from [Google AI Studio](https://aistudio.google.com) — free)
7. Wait for first deploy — test by visiting `/docs` (FastAPI auto-docs)

#### Step 14: Deploy React Frontend to Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. New Project → Import GitHub repo
3. Root directory: `frontend/`
4. Build command: `npm run build` (auto-detected)
5. Output directory: `dist` (auto-detected)
6. Add environment variable: `VITE_API_URL = https://your-app.onrender.com`
7. Deploy — Vercel gives you `https://jansahay.vercel.app` automatically

#### Step 15: Set Up Weekly Crawler via GitHub Actions

Create `.github/workflows/weekly_crawl.yml`:

```yaml
name: Weekly Crawler

on:
  schedule:
    - cron: "0 0 * * 0"  # Every Sunday midnight

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r backend/requirements.txt
      - run: python crawler/run_all.py
      - run: python scripts/parse_and_chunk.py
      - run: python scripts/embed_and_index.py
      - run: |
          git config user.email "action@github.com"
          git config user.name "GitHub Action"
          git add data/vectordb/
          git commit -m "Weekly index update"
          git push
    env:
      GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

- Add `GEMINI_API_KEY` to GitHub repo secrets: Settings → Secrets → Actions

---

## 14. Development Roadmap with Timeline

| Week | Tasks & Goals |
|---|---|
| Week 1 | Project setup. Build all 6 crawlers. Test data extraction from each portal. |
| Week 2 | Build parse + chunk + embed pipeline. Create FAISS index. Verify search accuracy. |
| Week 3 | Build FastAPI backend. Test `/chat`, `/schemes`, `/stats` endpoints with Postman. |
| Week 4 | Build React frontend — Home page, Chat page, Browse Schemes page. |
| Week 5 | Build Scheme Detail page. Add React Helmet SEO. Add FAQ and HowTo schemas. |
| Week 6 | Add multilingual support. Add voice input and output. Test in Hindi and Gujarati. |
| Week 7 | Responsive design polish. Mobile testing at 375px. Fix all layout issues. |
| Week 8 | Deploy to Vercel + Render. Set up GitHub Actions weekly crawler. Submit sitemap to Google. |
| Week 9 | End-to-end testing. Bug fixes. Performance optimization (Lighthouse audit). |
| Week 10 | Write README. Record demo video. Add to GitHub portfolio. Write LinkedIn post. |

---

## 15. Best Practices & Disclaimers

### Data & Legal Rules

- Only crawl public pages from official `.gov.in` domains
- Always cite the source portal in every AI response
- Respect `robots.txt` on all crawled sites — never violate crawl rules
- Never store any personally identifiable information about users
- Display clear disclaimer on every page: *"JanSahay AI is not affiliated with or endorsed by the Government of India"*
- Never give legal or financial advice — always direct users to the official portal for final verification

### AI Accuracy Rules

- Set `temperature=0.2` in Gemini API for factual, consistent, low-creativity responses
- If no relevant chunk found in FAISS search, respond: *"I could not find this information. Please visit [official portal URL] directly."*
- Never allow the model to generate scheme details that are not in the retrieved context
- Always show the source URL alongside every answer — make it clickable

---

## 16. Challenges & Solutions

| Challenge | Solution |
|---|---|
| Government portals change their HTML structure | Weekly crawler auto-detects 404s. Log them. Use flexible CSS selectors instead of exact class names. |
| Scanned PDF files (images instead of text) | Try pdfplumber first. If output is empty, fall back to Tesseract OCR via pytesseract. |
| Render free tier cold start (30 second delay) | Show loading animation with message: "Connecting to server, please wait..." on frontend. |
| Gemini API rate limit (15 RPM on free tier) | Add request queue in FastAPI. Cache identical questions in SQLite with 24-hour TTL. |
| Multilingual embedding accuracy | Always embed in English. Translate query to English before embedding. Translate answer back to user language after generation. |
| FAISS index growing too large | Use `IndexIVFFlat` instead of `IndexFlatL2` for indexes above 100K chunks. For this project, `IndexFlatL2` is sufficient. |
| Mobile performance on slow 2G/3G networks | Lazy load images. Code-split React routes. Use gzip compression on FastAPI responses. Keep initial bundle < 200KB. |

---

## 17. Future Scope

- **WhatsApp Bot** integration using Meta Cloud API (free tier) — the single highest-impact distribution channel for rural India
- **State-level scheme data** (currently only central government schemes covered)
- **Nearby Common Service Centre locator** using Google Maps free tier API
- **Scheme application deadline notifications** via browser push notifications (free with service workers)
- **Progressive Web App (PWA) mode** — offline access to cached schemes in areas with no internet
- **Admin dashboard** (protected `/admin` route) for monitoring crawler health, query volume, and error logs
- **DigiLocker API integration** to help users find which documents they already have

---

*JanSahay AI — Built with Rs. 0. Designed to create real impact for every Indian citizen.*