import os
import json
import shutil
import uuid
from io import BytesIO
from fastapi import FastAPI, HTTPException, Query, Depends, Request, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from supabase import create_client, Client
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Optional, List, Dict
import re
import time
from supabase import Client
import httpx
import asyncio 
from rag_pipeline import rag_system
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from datetime import datetime, timedelta
import tempfile
from pathlib import Path
import requests
import yfinance as yf
import aiohttp

# --- CONFIGURATION & SETUP ---
load_dotenv()
app = FastAPI(title="SynergyAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- SUPABASE BACKEND CLIENT ---
try:
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client initialized successfully.")
except Exception as e:
    print(f"FATAL ERROR: Could not initialize Supabase client: {e}")
    exit(1)

OLLAMA_SERVER_URL = "http://localhost:11434/api/generate"
# The name of the custom model we created
CUSTOM_MODEL_NAME = "synergyai-specialist" 

class NewsService:
    def __init__(self):
        self.newsapi_key = os.getenv('NEWSAPI_KEY')
        if not self.newsapi_key or self.newsapi_key == 'your_actual_newsapi_key_here':
            print("⚠️  NewsAPI key not configured. Using fallback M&A news.")
            self.newsapi_key = None
    
    async def get_live_market_news(self):
        """Get M&A relevant market news - deals, investments, regulations, earnings"""
        
        # If no API key, return M&A focused fallback news
        if not self.newsapi_key:
            return self.get_ma_fallback_news()
            
        try:
            # M&A specific search queries
            ma_keywords = [
                "merger acquisition deal", 
                "private equity investment", 
                "venture capital funding",
                "IPO listing", 
                "quarterly results earnings", 
                "regulatory approval",
                "competition commission", 
                "stock market sensex nifty",
                "foreign direct investment",
                "startup funding round"
            ]
            
            # Search for M&A relevant news from last 24 hours
            from_date = (datetime.now() - timedelta(hours=24)).strftime('%Y-%m-%d')
            
            all_articles = []
            
            # Search with multiple M&A relevant queries
            for keyword in ma_keywords[:3]:  # Limit to 3 queries to stay within rate limits
                url = f"https://newsapi.org/v2/everything?q={keyword}&from={from_date}&sortBy=publishedAt&language=en&pageSize=10&apiKey={self.newsapi_key}"
                
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    articles = response.json().get('articles', [])
                    all_articles.extend(articles)
            
            # Remove duplicates based on title
            seen_titles = set()
            unique_articles = []
            for article in all_articles:
                if article['title'] not in seen_titles:
                    seen_titles.add(article['title'])
                    unique_articles.append(article)
            
            # Sort by date and take top 20
            unique_articles.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
            ma_articles = unique_articles[:20]
            
            live_news = []
            for i, article in enumerate(ma_articles):
                live_news.append({
                    "id": f"live_{i}_{article['publishedAt']}",
                    "title": article['title'],
                    "source": article['source']['name'],
                    "timestamp": article['publishedAt'],
                    "url": article['url'],
                    "companyName": self.extract_company_name(article['title']),
                    "priority": self.assess_ma_priority(article['title'], article['description'] or ''),
                    "isLive": True,
                    "dealRelevance": self.assess_deal_relevance(article['title'], article['description'] or '')
                })
            
            return live_news
            
        except Exception as e:
            print(f"NewsAPI error: {e}")
            return self.get_ma_fallback_news()
    
    def extract_company_name(self, title):
        """Extract company names from news title - focus on Indian companies"""
        indian_companies = {
            'reliance': 'Reliance Industries',
            'tata': 'Tata Group', 
            'adani': 'Adani Group',
            'infosys': 'Infosys',
            'hdfc': 'HDFC Bank',
            'icici': 'ICICI Bank',
            'mahindra': 'Mahindra Group',
            'wipro': 'Wipro',
            'bajaj': 'Bajaj Group',
            'bharti': 'Bharti Airtel',
            'itc': 'ITC Limited',
            'lt': 'Larsen & Toubro',
            'sun pharma': 'Sun Pharmaceutical',
            'asian paints': 'Asian Paints',
            'hindustan unilever': 'Hindustan Unilever',
            'coal india': 'Coal India',
            'ntpc': 'NTPC Limited',
            'ongc': 'ONGC',
            'sbi': 'State Bank of India',
            'axis bank': 'Axis Bank'
        }
        
        title_lower = title.lower()
        for keyword, company_name in indian_companies.items():
            if keyword in title_lower:
                return company_name
        
        # Check for startup names and PE/VC deals
        startup_indicators = ['startup', 'funding', 'series', 'venture', 'pe', 'vc']
        if any(indicator in title_lower for indicator in startup_indicators):
            return "Private Company"
            
        return "Market News"
    
    def assess_ma_priority(self, title, description):
        """Assess news priority for M&A context"""
        text = f"{title} {description}".lower()
        
        # Critical for M&A analysts
        critical_words = [
            'merger', 'acquisition', 'takeover', 'buyout', 'deal signed',
            'regulatory approval', 'competition commission', 'sebi', 'rbi approval'
        ]
        
        # High importance
        high_words = [
            'earnings', 'results', 'quarterly', 'annual', 'profit', 'revenue',
            'investment', 'funding', 'series a', 'series b', 'series c',
            'ipo', 'listing', 'stock market', 'sensex', 'nifty'
        ]
        
        # Medium importance
        medium_words = [
            'expansion', 'new plant', 'facility', 'partnership', 'collaboration',
            'market share', 'competition', 'rival'
        ]
        
        if any(word in text for word in critical_words):
            return "Critical"
        elif any(word in text for word in high_words):
            return "High"
        elif any(word in text for word in medium_words):
            return "Medium"
        else:
            return "Low"
    
    def assess_deal_relevance(self, title, description):
        """Score how relevant this news is for deal sourcing (1-10)"""
        text = f"{title} {description}".lower()
        score = 0
        
        # Deal-specific keywords
        deal_keywords = {
            'merger': 3, 'acquisition': 3, 'm&a': 3, 'takeover': 3,
            'private equity': 2, 'venture capital': 2, 'funding': 2,
            'ipo': 2, 'listing': 2, 'investment': 1,
            'earnings': 1, 'results': 1, 'growth': 1
        }
        
        for keyword, points in deal_keywords.items():
            if keyword in text:
                score += points
                
        return min(score, 10)  # Cap at 10
    
    def get_ma_fallback_news(self):
        """M&A focused fallback news"""
        return [
            {
                "id": "fallback_1",
                "title": "Indian M&A activity reaches record high in Q4 2024",
                "source": "M&A Today",
                "timestamp": datetime.now().isoformat(),
                "url": "#",
                "companyName": "Market Analysis",
                "priority": "High",
                "isLive": True,
                "dealRelevance": 8
            },
            {
                "id": "fallback_2",
                "title": "Private equity firms show strong interest in Indian tech startups",
                "source": "VC Circle",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "url": "#",
                "companyName": "Private Equity",
                "priority": "High", 
                "isLive": True,
                "dealRelevance": 9
            },
            {
                "id": "fallback_3",
                "title": "Regulatory approvals accelerate for cross-border acquisitions",
                "source": "Financial Express",
                "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
                "url": "#",
                "companyName": "Regulatory News",
                "priority": "Critical",
                "isLive": True,
                "dealRelevance": 7
            },
            {
                "id": "fallback_4",
                "title": "Tech sector leads Q3 earnings with 25% YoY growth",
                "source": "Business Standard", 
                "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
                "url": "#",
                "companyName": "Technology Sector",
                "priority": "High",
                "isLive": True,
                "dealRelevance": 6
            }
        ]
    
    async def get_user_project_news(self, user_id: str):
        """Get project-specific news from database"""
        try:
            result = supabase.rpc('get_user_projects_news', {'p_user_id': user_id}).execute()
            
            project_news = []
            for event in result.data:
                project_news.append({
                    "id": event['id'],
                    "title": event['summary'],
                    "source": event.get('source_url', 'Internal Database'),
                    "timestamp": event['event_date'].isoformat() if hasattr(event['event_date'], 'isoformat') else event['event_date'],
                    "url": event.get('source_url', '#'),
                    "companyName": event['company_name'],
                    "priority": event['severity'],
                    "projectId": event['project_id'],
                    "isLive": False
                })
            
            return project_news
            
        except Exception as e:
            print(f"Database news error: {e}")
            return []
        

# --- DATA MODELS ---
class UserSignUpCredentials(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str = Field(..., alias='confirmPassword')

class UserLoginCredentials(BaseModel):
    email: str
    password: str

class WatchlistCreate(BaseModel): name: str
async def get_current_user_id(request: Request) -> str:
    token = request.headers.get("Authorization", "").split(" ")[-1]
    if not token: raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_res = supabase.auth.get_user(token)
        if user_res.user: return user_res.user.id
        else: raise HTTPException(status_code=401, detail="Invalid token")
    except Exception: raise HTTPException(status_code=401, detail="Invalid token")
    
async def get_current_user_id(request: Request) -> str:
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = token.split(" ")[1] # Remove "Bearer " prefix
        user_res = supabase.auth.get_user(token)
        if user_res.user:
            return user_res.user.id
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "SynergyAI API is running."}

# === AUTHENTICATION ENDPOINTS ===
@app.post("/api/auth/signup")
async def signup_user(credentials: UserSignUpCredentials):
    """Handles new user registration with name and password confirmation."""
    if credentials.password != credentials.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    try:
        res = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": { "data": { 'full_name': credentials.name } }
        })

        if res.user:
            # After signup, also insert the name into our public 'users' table
            supabase.table('users').update({'name': credentials.name}).eq('id', res.user.id).execute()
            return {"message": "Signup successful! Please check your email for confirmation."}
        elif res.user is None and res.session is None:
            raise HTTPException(status_code=400, detail="User with this email already exists.")
        else:
            raise HTTPException(status_code=500, detail="An unknown error occurred during signup.")
             
    except Exception as e:
        error_message = str(e.args[0]) if e.args else "An unexpected error occurred."
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_message}")

@app.post("/api/auth/login")
async def login_user(credentials: UserLoginCredentials):
    """Handles user login and returns a session object."""
    try:
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        if res.session:
            return {"message": "Login successful!", "session": res.session.model_dump_json()}
        else:
            raise HTTPException(status_code=401, detail="Invalid login credentials.")
           
    except Exception as e:
        raise HTTPException(status_code=400, detail="Login failed.")

@app.get("/api/health")
def health_check():
    """Check if the API and Supabase are working"""
    try:
        # Test Supabase connection by making a simple query
        result = supabase.table('companies').select('cin').limit(1).execute()
        return {
            "status": "healthy",
            "database": "connected via Supabase",
            "connection_type": "supabase_client"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
@app.get("/api/companies/search_by_text")
def search_companies_by_text(query: Optional[str] = Query(None)):
    """Search companies by text using Supabase client"""
    try:
        if not query or len(query.strip()) < 2:
            return []

        cleaned_query = query.strip()
        if len(cleaned_query) < 2:
            return []
        
        # Use Supabase ilike search for name and industry
        # Since text_search might not be available, use ilike as fallback
        result = supabase.table('companies').select(
            'cin, name, logo_url, industry, financial_summary'
        ).or_(
            f'name.ilike.%{cleaned_query}%,industry->>sector.ilike.%{cleaned_query}%,industry->>sub_sector.ilike.%{cleaned_query}%'
        ).range(0, 19).execute()  # range(0, 19) = limit 20
        
        return result.data
        
    except Exception as e:
        print(f"Search error: {e}")
        # Fallback to simple name search if complex query fails
        try:
            result = supabase.table('companies').select(
                'cin, name, logo_url, industry, financial_summary'
            ).ilike('name', f'%{cleaned_query}%').range(0, 19).execute()
            return result.data
        except Exception as e2:
            print(f"Fallback search error: {e2}")
            return []
        
@app.get("/api/companies/filter")
def filter_companies(
    revenue_min: Optional[int] = Query(None),
    employee_max: Optional[int] = Query(None),
    sector: Optional[str] = Query(None),
    hq_state: Optional[str] = Query(None),
    ebitda_margin_min: Optional[float] = Query(None),
    roe_min: Optional[float] = Query(None)
):
    """Filter companies using Supabase client"""
    try:
        query_builder = supabase.table('companies').select(
            'cin, name, logo_url, industry, financial_summary'
        )
        
        # Apply filters
        if revenue_min is not None:
            query_builder = query_builder.gte('financial_summary->>revenue_cr', str(revenue_min))
        if employee_max is not None:
            query_builder = query_builder.lte('financial_summary->>employee_count', str(employee_max))
        if sector and sector != 'All':
            query_builder = query_builder.ilike('industry->>sector', f'%{sector}%')
        if hq_state and hq_state != 'All':
            query_builder = query_builder.ilike('location->>headquarters', f'%, {hq_state}%')
        if ebitda_margin_min is not None:
            query_builder = query_builder.gte('financial_summary->>ebitda_margin_pct', str(ebitda_margin_min))
        if roe_min is not None:
            query_builder = query_builder.gte('financial_summary->>roe_pct', str(roe_min))
        
        result = query_builder.order('name').execute()
        return result.data
        
    except Exception as e:
        print(f"Filter error: {e}")
        return []

# --- FIXED WATCHLIST ENDPOINTS ---
class WatchlistCreate(BaseModel):
    name: str

@app.get("/api/watchlists_with_counts", response_model=List[Dict])
async def get_watchlists_with_counts(user_id: str = Depends(get_current_user_id)):
    """Fetches all user watchlists and includes the count of companies in each."""
    try:
        # We call our efficient database function via RPC (Remote Procedure Call)
        result = supabase.rpc('get_user_watchlists_with_counts', {'p_user_id': user_id}).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching watchlists with counts: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch watchlists with counts.")


@app.get("/api/watchlists", response_model=List[Dict])
async def get_watchlists(user_id: str = Depends(get_current_user_id)):
    """Fetches all watchlists (name and id) created by the current user."""
    try:
        result = supabase.table('watchlists').select('id, name').eq('user_id', user_id).order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch watchlists.")
@app.post("/api/watchlists")
async def create_watchlist(watchlist: WatchlistCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a new, empty watchlist for the current user."""
    try:
        print(f"Creating watchlist: {watchlist.name} for user: {user_id}")
        
        # Correct way to insert and return the inserted data
        result = supabase.table('watchlists').insert({
            'user_id': user_id, 
            'name': watchlist.name
        }).execute()
        
        print(f"Insert result: {result}")
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Insert operation returned no data")
            
    except Exception as e:
        print(f"Error creating watchlist: {e}")
        raise HTTPException(status_code=500, detail="Could not create watchlist.")
    

@app.get("/api/watchlists/{watchlist_id}/companies")
async def get_watchlist_companies(watchlist_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches all companies in a specific watchlist for the current user."""
    try:
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: raise HTTPException(status_code=403, detail="Forbidden")
        result = supabase.table('watchlist_companies').select('companies(*)').eq('watchlist_id', watchlist_id).execute()
        return [item['companies'] for item in result.data if item.get('companies')]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch companies for this watchlist.")

@app.post("/api/watchlists/{watchlist_id}/companies")
async def add_company_to_watchlist(watchlist_id: str, request: Request, user_id: str = Depends(get_current_user_id)):
    """Adds a single company to a specific watchlist."""
    try:
        body = await request.json()
        company_cin = body.get('company_cin')
        if not company_cin: raise HTTPException(status_code=400, detail="Company CIN is required")
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: raise HTTPException(status_code=403, detail="Forbidden")
        result = supabase.table('watchlist_companies').upsert({
            'watchlist_id': watchlist_id,
            'company_cin': company_cin,
            'user_id': user_id
        }).execute()
        return {"message": "Company added to watchlist successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not add company to watchlist.")

@app.delete("/api/watchlists/{watchlist_id}/companies/{company_cin}")
async def remove_company_from_watchlist(watchlist_id: str, company_cin: str, user_id: str = Depends(get_current_user_id)):
    """Removes a specific company from a specific watchlist."""
    try:
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: raise HTTPException(status_code=403, detail="Forbidden")
        result = supabase.table('watchlist_companies').delete().match({
            'watchlist_id': watchlist_id,
            'company_cin': company_cin,
            'user_id': user_id
        }).execute()
        return {"message": "Company removed from watchlist successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not remove company from watchlist.")


# --- THIS IS THE DEFINITIVE, FULLY-FEATURED MARKET MAP ENDPOINT ---
@app.get("/api/companies/market_map")
def get_market_map_data(
    sector: Optional[str] = Query(None),
    hq_state: Optional[str] = Query(None),
    revenue_min: Optional[int] = Query(None),
    growth_min: Optional[float] = Query(None),
    ebitda_margin_min: Optional[float] = Query(None),
    roe_min: Optional[float] = Query(None)
):
    """Fetches and formats company data for the Market Map based on a rich set of filters."""
    try:
        query = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary')
        
        # Apply filters
        if sector and sector != 'All':
            query = query.eq('industry->>sector', sector)
        if hq_state and hq_state != 'All':
            query = query.ilike('location->>headquarters', f'%, {hq_state}')
        if revenue_min is not None:
            query = query.gte('financial_summary->>revenue_cr', revenue_min)
        if growth_min is not None:
            query = query.gte('financial_summary->>growth_rate_pct', growth_min)
        if ebitda_margin_min is not None:
            query = query.gte('financial_summary->>ebitda_margin_pct', ebitda_margin_min)
        if roe_min is not None:
            query = query.gte('financial_summary->>roe_pct', roe_min)

        result = query.limit(100).execute() # Limit to 100 nodes for performance

        map_data = []
        for company in result.data:
            fs = company.get('financial_summary', {})
            ind = company.get('industry', {})
            if all([fs, ind, fs.get('revenue_cr'), fs.get('growth_rate_pct'), fs.get('employee_count'), ind.get('sector')]):
                map_data.append({
                    'cin': company['cin'], 'name': company['name'], 'logoUrl': company['logo_url'],
                    'sector': ind.get('sector'), 'revenue': float(fs.get('revenue_cr', 0)),
                    'growth': float(fs.get('growth_rate_pct', 0)), 'employees': int(fs.get('employee_count', 0)),
                    'ebitdaMargin': float(fs.get('ebitda_margin_pct', 0)), 'roe': float(fs.get('roe_pct', 0))
                })
        return map_data
    except Exception as e:
        print(f"Market map error: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch market map data.")

class AIQuery(BaseModel):
    question: str
    project_id: Optional[str] = None
 
@app.post("/api/ai/query")
async def handle_ai_query(query: AIQuery):
    """
    This is the main AI endpoint. It uses the RAG pipeline to provide context
    to our fine-tuned model running on Ollama.
    """
    try:
        # 1. Use our RAG "Smart Library" to find relevant context
        print(f"--- RAG: Searching for context for question: '{query.question}' ---")
        context_chunks = rag_system.search(query.question)
        
        if not context_chunks:
            context_text = "No relevant context was found in the document library for this query."
        else:
            # Format the retrieved chunks into a clean context block for the prompt
            context_text = "\n\n---\n\n".join([chunk['content'] for chunk in context_chunks])

        # 2. Construct the definitive prompt for our fine-tuned model
        prompt = f"Instruction: {query.question}\n\nContext: {context_text}\n\nResponse:"
        
        print("--- Sending prompt to SynergyAI Specialist model via Ollama... ---")

        # 3. Call our local Ollama server
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                OLLAMA_SERVER_URL,
                json={
                    "model": CUSTOM_MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            
        ai_response = response.json()
        final_answer = ai_response.get('response', 'Sorry, I could not generate a response.').strip()
        
        print(f"--- Received response from model. ---")
        # We return the AI's answer AND the sources it used
        return {"answer": final_answer, "sources": context_chunks}

    except httpx.RequestError as e:
        print(f"❌ HTTP Error: Could not connect to Ollama server. Is it running?")
        raise HTTPException(status_code=503, detail="AI service is unavailable.")
    except Exception as e:
        print(f"❌ An error occurred in the AI query pipeline: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

class StrategicQuery(BaseModel):
    query: str

def parse_strategic_query(query: str):
    """A smarter parser to extract structured filters from a natural language query."""
    filters = {}
    revenue_match = re.search(r'revenue (?:greater than|>)\s*[₹]?\s*(\d+)', query, re.IGNORECASE)
    if revenue_match: filters['revenue_min'] = int(revenue_match.group(1))
    
    locations = ['maharashtra', 'karnataka', 'delhi', 'gurgaon', 'mumbai', 'bengaluru', 'chennai', 'noida']
    query_lower = query.lower()
    for loc in locations:
        if loc in query_lower:
            filters['hq_state'] = loc
            break
    return filters

async def score_and_stream(candidates: List[Dict], user_query: str):
    """
    An asynchronous generator that scores companies in parallel and yields
    the results one by one, with heartbeats to keep the connection alive.
    """
    # --- The "Heartbeat" ---
    yield json.dumps({"type": "status", "message": f"Analyzing {len(candidates)} candidates..."}) + "\n"

    async def score_company(client, company):
        try:
            company_dossier = f"Name: {company.get('name')}, Sector: {company.get('industry', {}).get('sector')}, Revenue (Cr): {company.get('financial_summary', {}).get('revenue_cr')}"
            prompt = f"Instruction: You are an M&A analyst. Based on the User's Goal, provide a 'Strategic Fit Score' (0-100) and a brief rationale. Respond ONLY with a JSON object like {{\"fitScore\": <score>, \"rationale\": \"<text>\"}}.\n\nUser's Strategic Goal: \"{user_query}\"\n\nCompany Data:\n{company_dossier}\n\nResponse (JSON only):"
            
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "synergyai-specialist", "prompt": prompt, "stream": False},
                timeout=60.0
            )
            response.raise_for_status()
            
            ai_response = json.loads(response.json().get('response', '{}'))
            return {"type": "result", "data": { "company": company, "fitScore": ai_response.get('fitScore', 0), "rationale": ai_response.get('rationale', 'AI analysis failed.') }}
        except Exception as e:
            return {"type": "result", "data": { "company": company, "fitScore": 0, "rationale": f"Analysis failed: {e}" }}

    async with httpx.AsyncClient() as client:
        tasks = [score_company(client, company) for company in candidates]
        for future in asyncio.as_completed(tasks):
            result = await future
            if result:
                yield json.dumps(result) + "\n"

@app.post("/api/companies/strategic_search")
async def strategic_search(query: StrategicQuery):
    """
    Performs a high-performance, two-stage strategic search and STREAMS the results.
    """
    print(f"--- Received Strategic Search Query: '{query.query}' ---")
    
    # --- Stage 1: Smart Database Filtering ---
    try:
        parsed_filters = parse_strategic_query(query.query)
        db_query = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary, location').limit(10)
        
        if parsed_filters.get('revenue_min'):
            db_query = db_query.gte('financial_summary->>revenue_cr', parsed_filters['revenue_min'])
        if parsed_filters.get('hq_state'):
            db_query = db_query.ilike('location->>headquarters', f"%{parsed_filters['hq_state']}%")
            
        candidates_res = db_query.execute()
        candidates = candidates_res.data
        print(f"Found {len(candidates)} relevant candidates from database.")
        if not candidates: 
            return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

    # --- Stage 2: Stream the AI Analysis ---
    return StreamingResponse(score_and_stream(candidates, query.query), media_type="application/x-ndjson")


class ProjectCreate(BaseModel):
    name: str
    company_cin: str
    team_emails: List[str]

async def get_current_user_id(request: Request) -> str:
    token = request.headers.get("Authorization", "").split(" ")[-1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user_res = supabase.auth.get_user(token)
        if user_res.user:
            return user_res.user.id
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@app.get("/api/projects", response_model=List[Dict])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """
    Fetches all projects the current user is a member of by calling our
    powerful and efficient database function.
    """
    try:
        result = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch projects.")

@app.post("/api/projects")
async def create_project(project_data: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    """
    Creates a new project by calling our powerful and safe database function.
    This is now a single, atomic, and secure operation.
    """
    try:
        # --- THIS IS THE DEFINITIVE FIX ---
        # The Python code now correctly calls the smart function from your Canvas.
        result = supabase.rpc('create_project_and_add_members', {
            'p_name': project_data.name,
            'p_company_cin': project_data.company_cin,
            'p_creator_id': user_id,
            'p_team_emails': project_data.team_emails
        }).execute()
        
        if result.data:
            return {"message": f"Project '{project_data.name}' created successfully.", "project_id": result.data}
        else:
            raise Exception("Database function did not return a project ID.")
            
    except Exception as e:
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=f"Could not create project: {e}")

@app.get("/api/dashboard/chart_data")
async def get_chart_data(user_id: str = Depends(get_current_user_id)):
    try:
        projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        projects = projects_res.data
        if not projects:
            return {"bySector": [], "byStatus": []}

        sector_counts = {}
        status_counts = {}
        for proj in projects:
            sector = proj.get('targetCompany', {}).get('sector', 'Unknown')
            status = proj.get('status', 'Unknown')
            sector_counts[sector] = sector_counts.get(sector, 0) + 1
            status_counts[status] = status_counts.get(status, 0) + 1
        
        dist_by_sector = [{"name": k, "value": v} for k, v in sector_counts.items()]
        dist_by_status = [{"name": k, "value": v} for k, v in status_counts.items()]

        return {"bySector": dist_by_sector, "byStatus": dist_by_status}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch chart data.")


@app.get("/api/dashboard/narrative")
async def get_narrative(user_id: str = Depends(get_current_user_id)):
   
    try:
        projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        projects = projects_res.data
        deal_count = len(projects)
        
        rag_context_chunks = rag_system.search("Summarize the overall strategic initiatives, management outlook, and key identified risks from across all documents.", k=5)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        briefing = f"Total Active Deals: {deal_count}\n\nQualitative Insights from Documents:\n{rag_context}"
        prompt = f"Instruction: You are a senior M&A analyst. Based on the following context, write a detailed, insightful, multi-paragraph executive summary of the current deal pipeline. Use markdown bolding (**word**) to highlight all key metrics and important phrases.\n\nContext: {briefing}\n\nResponse:"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post("http://localhost:11434/api/generate", json={"model": "synergyai-specialist", "prompt": prompt, "stream": False})
            response.raise_for_status()
        
        ai_response = response.json()
        narrative = ai_response.get('response', 'Could not generate summary.').strip()
        
        return {"narrative": narrative}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not generate AI narrative.")

class AI_Summary_Export(BaseModel):
    narrative: str
    project_name: str # To add context to the PDF

@app.post("/api/export/summary_pdf")
async def export_summary_pdf(data: AI_Summary_Export):
    """
    Generates a high-quality, professional PDF from the AI narrative.
    """
    try:
        buffer = BytesIO()
        # Create the PDF object, using a buffer instead of a physical file.
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # --- PDF STYLING & CONTENT ---
        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(30, height - 50, "SynergyAI - AI Pipeline Summary")
        p.setFont("Helvetica", 10)
        p.drawString(30, height - 65, f"Project Context: {data.project_name}")
        p.line(30, height - 75, width - 30, height - 75)

        # Body Text (using Paragraph for automatic line wrapping)
        styles = getSampleStyleSheet()
        styleN = styles['BodyText']
        styleN.fontName = 'Helvetica'
        styleN.fontSize = 11
        # Replace markdown bolding with simple text for the PDF
        cleaned_narrative = data.narrative.replace("**", "")
        p_text = Paragraph(cleaned_narrative, styleN)
        
        # Draw the paragraph on the canvas, handling wrapping
        p_text.wrapOn(p, width - 60, height - 100)
        p_text.drawOn(p, 30, height - 100 - p_text.height)

        # Footer
        p.setFont("Helvetica-Oblique", 8)
        p.drawString(30, 40, f"Generated by SynergyAI on {time.strftime('%Y-%m-%d')}")
        
        # Close the PDF object - it's ready to be sent.
        p.showPage()
        p.save()
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=SynergyAI_Pipeline_Summary.pdf"
        })

    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF.")



class DocumentCreate(BaseModel):
    project_id: str
    file_name: str
    category: Optional[str] = "General"  # Add category field with default


@app.post("/api/vdr/documents")
async def upload_document_metadata(doc: DocumentCreate, user_id: str = Depends(get_current_user_id)):
    """
    Creates a document record and simulates processing.
    """
    try:
        # Create record with Pending status
        insert_data = {
            'project_id': doc.project_id,
            'file_name': doc.file_name,
            'uploaded_by_user_id': user_id,
            'file_path': f"uploads/{doc.project_id}/{doc.file_name}",
            'category': doc.category,
            'analysis_status': 'Pending',
            'uploaded_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('vdr_documents').insert(insert_data).execute()
        new_document = result.data[0]
        
        # Simulate processing (in real app, this would be a background task)
        # Update status to Success after a short delay
        import asyncio
        await asyncio.sleep(2)  # Simulate processing time
        
        # Update the document status to Success
        update_data = {
            'analysis_status': 'Success',
        }
        supabase.table('vdr_documents').update(update_data).eq('id', new_document['id']).execute()
        
        return new_document
        
    except Exception as e:
        print(f"Error creating document metadata: {e}")
        raise HTTPException(status_code=500, detail="Could not create document record.")
    

# Add endpoint to get available categories
@app.get("/api/projects/{project_id}/vdr/categories-list")
async def get_categories_list(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get list of available categories"""
    try:
        # Get unique categories from existing documents
        result = supabase.table('vdr_documents').select('category').eq('project_id', project_id).not_.is_('category', None).not_.eq('category', '').execute()
        
        categories = set()
        for item in result.data:
            if item['category']:
                categories.add(item['category'])
        
        # Add default categories if none exist
        if not categories:
            categories = {"Financials", "Legal & Compliance", "Human Resources", "Intellectual Property", "General"}
        else:
            categories.add("General")  # Always include General
        
        return sorted(list(categories))
        
    except Exception as e:
        print(f"Error fetching categories list: {e}")
        # Return default categories on error
        return ["Financials", "Legal & Compliance", "Human Resources", "Intellectual Property", "General"]
    
@app.get("/api/projects/{project_id}/vdr/documents")
async def get_vdr_documents(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches the most recent VDR documents for a given project."""
    try:
        result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).order('uploaded_at', desc=True).limit(10).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching documents: {e}")
        if hasattr(e, 'message'):
            print(f"Supabase error details: {e.message}")
        raise HTTPException(status_code=500, detail="Could not fetch VDR documents.")



@app.post("/api/vdr/documents")
async def upload_document_metadata(doc: DocumentCreate, user_id: str = Depends(get_current_user_id)):
    """Creates a document record and simulates processing."""
    try:
        insert_data = {
            'project_id': doc.project_id,
            'file_name': doc.file_name,
            'uploaded_by_user_id': user_id,
            'file_path': f"uploads/{doc.project_id}/{doc.file_name}",
            'category': 'Uncategorized',
            'analysis_status': 'Pending'
        }
        
        result = supabase.table('vdr_documents').insert(insert_data).execute()
        new_document = result.data[0]
        
        # Simulate processing
        import asyncio
        await asyncio.sleep(2)
        
        update_data = {'analysis_status': 'Success', 'category': 'General'}
        supabase.table('vdr_documents').update(update_data).eq('id', new_document['id']).execute()
        
        return new_document
        
    except Exception as e:
        print(f"Error creating document metadata: {e}")
        raise HTTPException(status_code=500, detail="Could not create document record.")
    
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
@app.post("/api/vdr/documents/upload")
async def upload_document(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    category: str = Form("General"),
    user_id: str = Depends(get_current_user_id)
):
    
    """Upload a document file and store it with metadata"""
    try:
        # Create project directory if it doesn't exist
        project_dir = UPLOAD_DIR / project_id
        project_dir.mkdir(exist_ok=True)
        
        # Generate a safe filename
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = project_dir / unique_filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create database record
        insert_data = {
            'project_id': project_id,
            'file_name': original_filename,
            'uploaded_by_user_id': user_id,
            'file_path': str(file_path),
            'category': category,
            'analysis_status': 'Success',
            'file_size': os.path.getsize(file_path),
            'mime_type': file.content_type
        }
        
        result = supabase.table('vdr_documents').insert(insert_data).execute()
        return result.data[0]
        
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail="Could not upload document")
    

@app.get("/api/vdr/documents/{document_id}/download")
async def download_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Download the actual uploaded file"""
    try:
        # Get document info from database
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        file_path = Path(document.get('file_path'))
        
        # Check if file exists
        if not file_path.exists():
            # Fallback: create a mock file for existing records
            if not UPLOAD_DIR.exists():
                UPLOAD_DIR.mkdir(exist_ok=True)
            
            # Create a mock file for demonstration
            mock_content = f"Document: {document.get('file_name', 'Unknown')}\n"
            mock_content += f"Project: {document.get('project_id', 'N/A')}\n"
            mock_content += f"Category: {document.get('category', 'N/A')}\n"
            mock_content += f"Uploaded by: {document.get('uploaded_by_user_id', 'N/A')}\n"
            mock_content += f"Uploaded at: {document.get('uploaded_at', 'N/A')}\n\n"
            mock_content += "This is a mock file since the original wasn't stored.\n"
            mock_content += "New uploads will store actual files."
            
            # Create mock file path
            project_dir = UPLOAD_DIR / document.get('project_id', 'default')
            project_dir.mkdir(exist_ok=True)
            mock_file_path = project_dir / f"mock_{document.get('file_name', 'document.txt')}"
            
            with open(mock_file_path, 'w') as f:
                f.write(mock_content)
            
            file_path = mock_file_path
        
        # Return the file
        return FileResponse(
            path=file_path,
            filename=document.get('file_name'),
            media_type=document.get('mime_type', 'application/octet-stream')
        )
        
    except Exception as e:
        print(f"Error downloading document: {e}")
        raise HTTPException(status_code=500, detail=f"Could not download document: {str(e)}")
    

# Add these to your FastAPI backend
@app.get("/api/projects/{project_id}/vdr/categories")
async def get_categories(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get all categories for a project including uncategorized"""
    try:
        # Get categories with document counts
        result = supabase.rpc('get_categories_with_counts', {'project_id_param': project_id}).execute()
        
        # If no categories found, return default set with 0 counts
        if not result.data:
            return [
                {'name': 'Financials', 'document_count': 0},
                {'name': 'Legal & Compliance', 'document_count': 0},
                {'name': 'Human Resources', 'document_count': 0},
                {'name': 'Intellectual Property', 'document_count': 0},
                {'name': 'Uncategorized', 'document_count': 0}
            ]
        
        return result.data
        
    except Exception as e:
        print(f"Error fetching categories: {e}")
        # Fallback to default categories
        return [
            {'name': 'Financials', 'document_count': 0},
            {'name': 'Legal & Compliance', 'document_count': 0},
            {'name': 'Human Resources', 'document_count': 0},
            {'name': 'Intellectual Property', 'document_count': 0},
            {'name': 'Uncategorized', 'document_count': 0}
        ]
    
@app.get("/api/projects/{project_id}/vdr/documents/category/{category}")
async def get_documents_by_category(project_id: str, category: str, user_id: str = Depends(get_current_user_id)):
    """Get documents by category (including uncategorized)"""
    try:
        # Handle different names for uncategorized
        if category.lower() in ['uncategorized', 'null', 'none', '']:
            # Get documents without category or with empty category
            result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).or_(f'category.is.null,category.eq.""').order('uploaded_at', desc=True).execute()
        else:
            # Get documents with specific category
            result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).eq('category', category).order('uploaded_at', desc=True).execute()
        
        return result.data
        
    except Exception as e:
        print(f"Error fetching documents by category: {e}")
        return []
    
@app.delete("/api/vdr/documents/{document_id}")
async def delete_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a document"""
    try:
        # First get document info to check permissions
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        
        # Check if user has permission to delete (uploader or admin)
        if document['uploaded_by_user_id'] != user_id:
            # In real app, you'd check admin role here
            raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        
        # Delete the document record
        supabase.table('vdr_documents').delete().eq('id', document_id).execute()
        
        # In real app, you'd also delete the actual file from storage
        import os
        if os.path.exists(document['file_path']):
            os.remove(document['file_path'])
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail="Could not delete document")
    
@app.get("/api/vdr/documents/{document_id}/preview")
async def preview_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """Get document content for preview"""
    try:
        # Get document info from database
        result = supabase.table('vdr_documents').select('*').eq('id', document_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = result.data[0]
        file_path = Path(document.get('file_path'))
        
        # Check if file exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read file content based on file type
        file_extension = file_path.suffix.lower()
        
        if file_extension == '.txt':
            # Read text files directly
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content
            
        elif file_extension == '.pdf':
            # For PDFs, return a message about PDF preview (you could integrate a PDF.js later)
            return f"PDF document: {document.get('file_name')}\n\nPDF preview would be implemented here with a proper PDF viewer library."
            
        else:
            # For other file types, return basic info
            return f"File: {document.get('file_name')}\nType: {file_extension}\n\nContent preview not available for this file type."
        
    except Exception as e:
        print(f"Error previewing document: {e}")
        raise HTTPException(status_code=500, detail=f"Could not preview document: {str(e)}")
    

class ChatSession(BaseModel):
    project_id: Optional[str] = None
    messages: List[Dict]

class ChatSessionUpdate(BaseModel):
    messages: List[Dict]

def debug_supabase_response(response):
    """Helper to debug Supabase response format"""
    print(f"Response type: {type(response)}")
    if hasattr(response, '__dict__'):
        print(f"Response attributes: {response.__dict__}")
    if hasattr(response, 'data'):
        print(f"Response data: {response.data}")
    if isinstance(response, tuple):
        print(f"Tuple length: {len(response)}")
        for i, item in enumerate(response):
            print(f"Item {i}: {type(item)} - {item}")

@app.get("/api/chat/history")
async def get_chat_history(user_id: str = Depends(get_current_user_id)):
    """Fetches all saved chat conversations for the current user."""
    try:
        # Supabase returns an APIResponse object with .data attribute
        result = supabase.table('chat_conversations').select(
            'id, title, messages, created_at, updated_at'
        ).eq('user_id', user_id).order('created_at', desc=True).execute()
        
        # Access the data using .data attribute
        data = result.data
        
        if not data:
            return []
            
        # Parse conversations
        conversations = []
        for convo in data:
            conversations.append({
                'id': convo['id'],
                'title': convo['title'],
                'messages': convo['messages'],
                'lastUpdated': convo['updated_at'] or convo['created_at']
            })
                
        return conversations
        
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch chat history."
        )

@app.post("/api/chat/history")
async def save_chat_history(session_data: ChatSession, user_id: str = Depends(get_current_user_id)):
    """Saves a new chat conversation and uses the AI to generate a title for it."""
    try:
        # Generate title from the conversation
        conversation_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in session_data.messages])
        prompt = f"Instruction: Summarize the following conversation in 5 words or less to use as a title.\n\nConversation:\n{conversation_text}\n\nTitle:"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate", 
                json={"model": "synergyai-specialist", "prompt": prompt, "stream": False},
                timeout=30.0
            )
            if response.status_code != 200:
                title = "New Chat Session"
            else:
                ai_response = response.json()
                title = ai_response.get('response', 'New Chat Session').strip().replace('"', '')

        # Save to the database
        result = supabase.table('chat_conversations').insert({
            'user_id': user_id,
            'project_id': session_data.project_id,
            'title': title,
            'messages': session_data.messages
        }).execute()
        
        # Access the data using .data attribute
        data = result.data
        
        if not data:
            raise HTTPException(status_code=500, detail="Failed to save chat history")
            
        return data[0]
        
    except Exception as e:
        print(f"Error saving chat history: {e}")
        raise HTTPException(status_code=500, detail="Could not save chat history.")

@app.put("/api/chat/history/{conversation_id}")
async def update_chat_history(conversation_id: str, session_data: ChatSessionUpdate, user_id: str = Depends(get_current_user_id)):
    """Updates an existing chat conversation with new messages."""
    try:
        # First, verify the conversation exists and belongs to the user
        check_result = supabase.table('chat_conversations').select('id').eq('id', conversation_id).eq('user_id', user_id).execute()
        check_data = check_result.data
        
        if not check_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied"
            )
        
        # Update the conversation
        result = supabase.table('chat_conversations').update({
            'messages': session_data.messages,
            'updated_at': 'now()'
        }).eq('id', conversation_id).eq('user_id', user_id).execute()
        
        return {"message": "Conversation updated successfully."}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update chat history."
        )
    
@app.get("/api/projects/{project_id}/risk_profile")
async def get_project_risk_profile(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Generates a complete, AI-driven risk profile for the target company
    associated with a specific project. This is a professional-grade simulation.
    """
    try:
        # Step 1: Fetch the project to get the target company's CIN
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        company_cin = project_res.data['company_cin']
        
        # Step 2: Fetch the target company's details
        company_res = supabase.table('companies').select('name').eq('cin', company_cin).single().execute()
        company_name = company_res.data['name'] if company_res.data else 'Unknown Company'

        # --- Step 3: AI-Powered Risk Generation (Simulated) ---
        # We generate a dynamic score based on the CIN to make the demo impressive.

        print("--- RAG: Searching for all risk-related context in VDR... ---")
        # In a real app, we'd filter RAG search by documents in this project_id
        rag_context_chunks = rag_system.search(
            "Find all text related to risks, liabilities, litigation, dependencies, competition, and challenges.", 
            k=10 # Get a wide range of context
        )
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        # --- Step 3: The Multi-Step AI Analysis ---
        # We now give our fine-tuned AI a complex, professional task.
        prompt = f"""Instruction: You are a senior M&A risk analyst. Your task is to create a complete risk profile for the acquisition of '{company_name}'. Based ONLY on the provided context from their VDR, generate a JSON object with the following structure: {{\"overallScore\": <0-100>, \"topRisks\": [{{\"risk\": \"<Identified Risk>\", \"mitigation\": \"<Suggested Mitigation>\"}}], \"detailedBreakdown\": [{{\"category\": \"<Category>\", \"score\": <0-100>, \"insights\": [\"<Insight 1>\"]}}]}}.

        Context from VDR Documents:
        {rag_context}

        Response (JSON object only):
        """
                
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "synergyai-specialist", "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        
        # Clean up the JSON response from the LLM
        # This is a robust way to handle potential markdown formatting
        cleaned_json_text = re.search(r'\{.*\}', ai_response_text, re.DOTALL).group(0)
        risk_profile_data = json.loads(cleaned_json_text)

        # Add the non-AI generated data
        risk_profile_data['id'] = company_cin
        risk_profile_data['name'] = company_name
        
        return risk_profile_data

    except Exception as e:
        print(f"Error generating risk profile: {e}")
        raise HTTPException(status_code=500, detail="Could not generate risk profile.")


@app.get("/api/projects/{project_id}/synergy_score")
async def get_synergy_ai_score(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Performs a full strategic fit audit for a project, combining database facts,
    document insights (RAG), and LLM reasoning to generate a definitive score.
    """
    try:
        # Step 1: Fetch structured data from PostgreSQL
        project_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        project = next((p for p in project_res.data if p['id'] == project_id), None)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied.")

        # --- Step 2: The RAG "Deep Dive" for qualitative insights ---
        print(f"--- RAG: Searching for strategic context for {project['name']}... ---")
        rag_query = f"Analyze the strategic rationale, market position, and potential risks for an acquisition of {project['targetCompany']['name']} based on all available documents."
        rag_context_chunks = rag_system.search(rag_query, k=10)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        # --- Step 3: The "Investment Committee" Prompt ---
        prompt = f"""Instruction: You are the head of a top-tier M&A investment committee. Your task is to conduct a final Strategic Fit Audit for the potential acquisition of {project['targetCompany']['name']}. Based ONLY on the provided context, generate a JSON object with the following structure: {{"overallScore": <0-100>, "subScores": [{{"category": "<Category>", "score": <0-100>, "summary": "<One-sentence summary>"}}], "rationale": "<A detailed, multi-paragraph analysis>"}}.

The categories for subScores must be exactly: 'Financial Synergy', 'Strategic Fit', and 'Risk Profile'. The rationale should be a professional, data-driven narrative explaining your scores.

Context from Database and VDR Documents:
Project Name: {project['name']}
Target Company: {project['targetCompany']}
Qualitative Insights from VDR:
{rag_context}

Response (JSON object only):
"""
        
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "synergyai-specialist", "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        print(f"Raw AI response: {ai_response_text}")  # Debug logging
        
        # --- Improved JSON parsing with better error handling ---
        try:
            # First, try to parse directly
            final_audit = json.loads(ai_response_text)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON using multiple methods
            try:
                # Method 1: Look for JSON pattern
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', ai_response_text, re.DOTALL)
                if json_match:
                    cleaned_json_text = json_match.group(0)
                    final_audit = json.loads(cleaned_json_text)
                else:
                    # Method 2: Try to fix common JSON issues
                    # Remove any text before and after the JSON
                    cleaned_text = re.sub(r'^[^{]*', '', ai_response_text)
                    cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
                    
                    # Fix common JSON syntax errors
                    cleaned_text = re.sub(r',\s*}', '}', cleaned_text)  # Remove trailing commas
                    cleaned_text = re.sub(r',\s*]', ']', cleaned_text)  # Remove trailing commas in arrays
                    
                    final_audit = json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed after cleanup: {e}")
                print(f"Problematic text: {ai_response_text}")
                
                # Fallback: Create a structured response manually
                final_audit = {
                    "overallScore": 75,
                    "subScores": [
                        {"category": "Financial Synergy", "score": 70, "summary": "Moderate financial synergy potential based on available data"},
                        {"category": "Strategic Fit", "score": 80, "summary": "Good strategic alignment with current portfolio"},
                        {"category": "Risk Profile", "score": 65, "summary": "Moderate risk profile requiring careful due diligence"}
                    ],
                    "rationale": "Unable to generate AI analysis due to technical issues. Please try again or check the AI service."
                }
        
        return final_audit

    except Exception as e:
        print(f"Error generating SynergyAI Score: {e}")
        # Provide a fallback response instead of crashing
        fallback_response = {
            "overallScore": 70,
            "subScores": [
                {"category": "Financial Synergy", "score": 65, "summary": "Analysis unavailable - service error"},
                {"category": "Strategic Fit", "score": 70, "summary": "Analysis unavailable - service error"},
                {"category": "Risk Profile", "score": 65, "summary": "Analysis unavailable - service error"}
            ],
            "rationale": f"Unable to generate complete analysis due to: {str(e)}. Please try again later."
        }
        return fallback_response
    
@app.get("/api/projects/{project_id}/knowledge_graph")
async def get_knowledge_graph(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Builds the complete relationship graph for a project's target company.
    """
    try:
        # Step 1: Fetch the project
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        
        target_cin = project_res.data['company_cin']
        nodes = {}
        links = []

        # Step 2: Add the target company as the central node
        target_company_res = supabase.table('companies').select('cin, name, financial_summary').eq('cin', target_cin).single().execute()
        if not target_company_res.data:
            raise HTTPException(status_code=404, detail="Target company not found.")
        
        target = target_company_res.data
        revenue = target.get('financial_summary', {}).get('revenue_cr', 0) if target.get('financial_summary') else 0
        nodes[target_cin] = {
            "id": target_cin, 
            "name": target['name'], 
            "category": "Target",
            "symbolSize": 80, 
            "value": f"Revenue: ₹{revenue:,} Cr"
        }

        # Step 3: Fetch and add executives
        try:
            exec_roles_res = supabase.table('executive_roles')\
                .select('executives(din, name), role')\
                .eq('company_cin', target_cin)\
                .execute()
            
            if exec_roles_res.data:
                for role_data in exec_roles_res.data:
                    executive = role_data.get('executives')
                    if executive and executive.get('din'):
                        din = executive['din']
                        if din not in nodes:
                            nodes[din] = {
                                "id": din, 
                                "name": executive['name'], 
                                "category": "Executive",
                                "symbolSize": 40, 
                                "value": role_data.get('role', 'Director')
                            }
                        links.append({"source": target_cin, "target": din})
                        
        except Exception as e:
            print(f"Warning: Error fetching executives: {e}")

        # Step 4: Fetch and add relationships
        try:
            relationships_res = supabase.table('company_relationships')\
                .select('*')\
                .eq('source_company_cin', target_cin)\
                .execute()
            
            for rel in relationships_res.data or []:
                rel_type = rel.get('relationship_type', '')
                target_company_cin = rel.get('target_company_cin')
                rel_name = rel.get('target_company_name', 'Unknown Company')
                
                # Use CIN if available, otherwise generate ID
                rel_id = target_company_cin if target_company_cin else f"rel_{rel_type}_{rel_name.replace(' ', '_').lower()}"
                
                # Map relationship type to category
                normalized_type = rel_type.lower().strip()
                
                category_map = {
                    'competitor': 'Competitor',
                    'subsidiary': 'Subsidiary', 
                    'partner': 'Partner',
                    'parent': 'Subsidiary',
                    'supplier': 'Partner',
                    'customer': 'Partner',
                    'rival': 'Competitor',
                    'subsidiaries': 'Subsidiary',
                    'competitors': 'Competitor',
                    'partners': 'Partner'
                }
                
                category = category_map.get(normalized_type, 'Partner')
                
                # If not found, try partial matching
                if category == 'Partner':
                    if 'competitor' in normalized_type or 'rival' in normalized_type:
                        category = 'Competitor'
                    elif 'subsidiary' in normalized_type:
                        category = 'Subsidiary'
                    elif 'partner' in normalized_type:
                        category = 'Partner'
                
                # Try to get company details if CIN is available
                company_value = category
                if target_company_cin:
                    try:
                        company_res = supabase.table('companies')\
                            .select('name, financial_summary')\
                            .eq('cin', target_company_cin)\
                            .single()\
                            .execute()
                        if company_res.data:
                            company = company_res.data
                            rel_name = company.get('name', rel_name)
                            revenue = company.get('financial_summary', {}).get('revenue_cr', 0) if company.get('financial_summary') else 0
                            if revenue:
                                company_value = f"Revenue: ₹{revenue:,} Cr"
                    except Exception as e:
                        # Use default values if company not found
                        pass

                if rel_id not in nodes:
                    symbol_sizes = {
                        'Competitor': 60,
                        'Subsidiary': 50,
                        'Partner': 55,
                        'Executive': 40,
                        'Target': 80
                    }
                    symbol_size = symbol_sizes.get(category, 50)
                    
                    nodes[rel_id] = {
                        "id": rel_id, 
                        "name": rel_name, 
                        "category": category,
                        "symbolSize": symbol_size, 
                        "value": company_value
                    }
                
                links.append({"source": target_cin, "target": rel_id})
                
        except Exception as e:
            print(f"Warning: Error fetching relationships: {e}")

        # Ensure we have categories for all node types present
        categories_present = set(node['category'] for node in nodes.values())
        categories = [{'name': cat} for cat in categories_present]

        return {
            "nodes": list(nodes.values()), 
            "links": links, 
            "categories": categories
        }

    except Exception as e:
        print(f"Error generating knowledge graph for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Could not generate knowledge graph.")

@app.get("/api/projects/{project_id}/alerts")
async def get_project_alerts(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    priorities: Optional[str] = Query(None, description="Comma-separated list of priorities"),
    types: Optional[str] = Query(None, description="Comma-separated list of event types")
):
    """
    Fetches all events/alerts for a project's target company, with advanced filtering.
    """
    try:
        # Step 1: Get the target company CIN for the project
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        target_cin = project_res.data['company_cin']

        # Step 2: Build a dynamic query
        query_builder = supabase.table('events').select('*').eq('company_cin', target_cin)

        # Apply filters if they are provided
        if priorities:
            priority_list = [p.strip() for p in priorities.split(',')]
            query_builder = query_builder.in_('severity', priority_list)
        if types:
            type_list = [t.strip() for t in types.split(',')]
            query_builder = query_builder.in_('event_type', type_list)

        result = query_builder.order('event_date', desc=True).limit(50).execute()

        # Step 3: Adapt the data to the frontend's 'Alert' type with proper None handling
        alerts = []
        for event in result.data:
            # Safely handle potential None values
            if event is None:
                continue
                
            # Safely get details with fallback for None
            details = event.get('details') or {}
            description = details.get('summary') if details else event.get('summary', 'No description available')
            
            alert_data = {
                "id": event.get('id', 'unknown'),
                "priority": event.get('severity', 'Low'),
                "title": event.get('summary', 'No title'),
                "type": event.get('event_type', 'Unknown'),
                "source": event.get('source_url', 'Internal'),
                "timestamp": event.get('event_date', 'N/A'),
                "description": description,
                "aiInsight": "AI insight generation for this alert is pending."
            }
            alerts.append(alert_data)

        return alerts
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching alerts: {str(e)}")
        # Provide more detailed error information
        raise HTTPException(status_code=500, detail=f"Could not fetch alerts: {str(e)}")
 
@app.get("/api/projects/{project_id}/valuation/templates")
async def get_project_valuation_templates(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get valuation templates specific to a project"""
    try:
        print(f"Fetching valuation templates for project: {project_id}, user: {user_id}")
        
        # Return default templates
        default_templates = [
                {
                    'id': 'dcf', 
                    'name': 'Discounted Cash Flow (DCF)', 
                    'description': 'Project future cash flows and discount them to arrive at a present value estimate.',
                    'lastUsed': '2 days ago',
                    'thumbnailUrl': '/thumbnails/dcf.png',
                    'projectId': project_id
                },
                {
                    'id': 'lbo', 
                    'name': 'Leveraged Buyout (LBO)', 
                    'description': 'Model a leveraged buyout transaction to determine the potential IRR for financial sponsors.',
                    'lastUsed': '1 week ago',
                    'thumbnailUrl': '/thumbnails/lbo.png',
                    'projectId': project_id
                },
                {
                    'id': 'cca', 
                    'name': 'Comparable Company Analysis', 
                    'description': 'Value a company by comparing it to similar publicly traded companies.',
                    'lastUsed': '5 days ago',
                    'thumbnailUrl': '/thumbnails/comps.png',
                    'projectId': project_id
                },
                {
                    'id': 'pt', 
                    'name': 'Precedent Transactions', 
                    'description': 'Analyze past M&A transactions of similar companies to derive valuation multiples.',
                    'lastUsed': '1 month ago',
                    'thumbnailUrl': '/thumbnails/precedents.png',
                    'projectId': project_id
                }
            ]
        return default_templates
        
    except Exception as e:
        print(f"Error in get_project_valuation_templates: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch project templates")
    

def filter_rag_results_by_project(rag_results: List[Dict], project_id: str) -> List[Dict]:
    """
    Filter RAG search results to only include documents from a specific project
    """
    try:
        # Get all document file paths for this project
        docs_res = supabase.table('vdr_documents').select('file_path').eq('project_id', project_id).execute()
        project_docs = [doc['file_path'] for doc in docs_res.data if doc.get('file_path')]
        
        if not project_docs:
            return []
        
        # Filter RAG results to only include project documents
        filtered_results = []
        for result in rag_results:
            result_source = result.get('source', '')
            for project_doc in project_docs:
                # Check if the result source matches any project document
                if project_doc in result_source or result_source in project_doc:
                    filtered_results.append(result)
                    break
        
        return filtered_results
        
    except Exception as e:
        print(f"Error filtering RAG results: {e}")
        return rag_results  # Return original results as fallback

class VdrSearchQuery(BaseModel):
    query: str
    mode: str # 'semantic' or 'fulltext'

@app.post("/api/projects/{project_id}/vdr/search")
async def vdr_search(project_id: str, search_query: VdrSearchQuery, user_id: str = Depends(get_current_user_id)):
    """
    Performs a search scoped ONLY to the documents within a specific project's VDR.
    """
    try:
        # --- Stage 1: The Security Check (Get the "Authorized Reading List") ---
        docs_res = supabase.table('vdr_documents').select('file_name').eq('project_id', project_id).execute()
        allowed_filenames = [doc['file_name'] for doc in docs_res.data]
        
        if not allowed_filenames:
            return [] # No documents in this project's VDR

        print(f"--- VDR Search: Project '{project_id}', searching within {len(allowed_filenames)} documents ---")

        if search_query.mode == 'semantic':
            # --- Stage 2: The Scoped Semantic Search ---
            context_chunks = rag_system.search(search_query.query, k=10, allowed_sources=allowed_filenames)
            
            results = []
            for chunk in context_chunks:
                highlighted_excerpt = chunk['content'].replace(search_query.query, f"<mark>{search_query.query}</mark>")
                results.append({ "docName": chunk['source'], "excerpt": f"...{highlighted_excerpt}..." })
            return results
        
        else: # 'fulltext' search
            # This search is already project-specific, so it's correct.
            fulltext_res = supabase.table('vdr_documents').select('id, file_name').eq('project_id', project_id).ilike('file_name', f"%{search_query.query}%").limit(10).execute()
            return [{ "docName": doc['file_name'], "excerpt": "Keyword match found in document title." } for doc in fulltext_res.data]

    except Exception as e:
        print(f"Error during VDR search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during VDR search.")



class VDRQuery(BaseModel):
    question: str
    existing_messages: List[Dict]


# This is the "get history" endpoint
@app.get("/api/projects/{project_id}/vdr/chat")
async def get_vdr_chat_history(project_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('vdr_qa_sessions').select('id, messages').eq('project_id', project_id).limit(1).single().execute()
        if not result.data: return {"id": None, "messages": []}
        result.data['messages'] = json.loads(result.data.get('messages', '[]'))
        return result.data
    except Exception as e:
        if "PGRST116" not in str(e): print(f"Error fetching VDR chat: {e}")
        return {"id": None, "messages": []}

# This is the "ask a question AND save the result" endpoint
@app.post("/api/projects/{project_id}/vdr/qa")
async def vdr_qa_and_save(project_id: str, query: VDRQuery, user_id: str = Depends(get_current_user_id)):
    try:
        docs_res = supabase.table('vdr_documents').select('id, file_name').eq('project_id', project_id).execute()
        filename_to_id_map = {doc['file_name']: doc['id'] for doc in docs_res.data}
        allowed_filenames = list(filename_to_id_map.keys())
        context_chunks = rag_system.search(query.question, k=5, allowed_sources=allowed_filenames)
        
        context_text = "No relevant context found."
        sources = []
        if context_chunks:
            context_text = "\n\n---\n\n".join([f"From '{c['source']}':\n{c['content']}" for c in context_chunks])
            sources = [{"docId": filename_to_id_map.get(c['source']), "docName": c['source'], "excerpt": c['content']} for c in context_chunks]

        prompt = f"Instruction: You are an AI paralegal...Answer:" # (Full prompt from previous step)
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
        
        final_answer = response.json().get('response', 'Error.').strip()
        assistant_message = {"role": "assistant", "content": final_answer, "sources": sources}
        updated_messages = query.existing_messages + [assistant_message]
        
        supabase.table('vdr_qa_sessions').upsert({'project_id': project_id, 'user_id': user_id, 'messages': json.dumps(updated_messages)}, on_conflict='project_id').execute()
        return assistant_message
    except Exception as e: raise HTTPException(status_code=500, detail="VDR Q&A process failed.")


# --- THIS IS THE NEW, DEFINITIVE FILE DOWNLOAD ENDPOINT ---
@app.get("/api/vdr/documents/{document_id}/download")
async def download_document(document_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Securely fetches a document's metadata, finds the file on the server's local disk,
    and returns it for viewing or download.
    """
    try:
        doc_res = supabase.table('vdr_documents').select('*').eq('id', document_id).single().execute()
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document = doc_res.data
        # In a real app, you would add a check here to ensure the user_id has permission for this project.

        file_path = Path(document.get('file_path'))
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found on server.")
        
        return FileResponse(
            path=file_path,
            filename=document.get('file_name'),
            media_type='application/pdf' # Assuming PDF for simplicity
        )
    except Exception as e:
        print(f"Error downloading document: {e}")
        raise HTTPException(status_code=500, detail="Could not download document.")



@app.get("/api/news/projects")
async def get_projects_news(user_id: str = Depends(get_current_user_id)):
    """Fetches the latest news for all projects the user is a member of."""
    try:
        result = supabase.rpc('get_user_projects_news', {'p_user_id': user_id}).execute()
        # Adapt the data to the frontend's 'NewsItem' type
        news_items = [{
            "id": event['id'], "priority": event['severity'], "title": event['summary'],
            "source": event.get('source_url', 'Internal'), "timestamp": event['event_date'],
            "companyName": event['company_name'], "projectId": event['project_id']
        } for event in result.data]
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch project news.")

@app.get("/api/news/market")
async def get_market_news(user_id: str = Depends(get_current_user_id)):
    """Fetches the latest news from all companies in the database."""
    try:
        result = supabase.table('events').select('*, companies(name)').order('event_date', desc=True).limit(20).execute()
        news_items = [{
            "id": event['id'], "priority": event['severity'], "title": event['summary'],
            "source": event.get('source_url', 'Internal'), "timestamp": event['event_date'],
            "companyName": event['companies']['name'] if event.get('companies') else 'Unknown'
        } for event in result.data]
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch market news.")

news_service = NewsService()

@app.get("/api/news/live")
async def get_live_combined_news(user_id: str = Depends(get_current_user_id)):
    """Get combined live market news and project news"""
    try:
        market_news = await news_service.get_live_market_news()
        project_news = await news_service.get_user_project_news(user_id)
        
        return {
            "market_news": market_news,
            "project_news": project_news,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News fetch error: {str(e)}")

@app.get("/api/news/projects")
async def get_projects_news(user_id: str = Depends(get_current_user_id)):
    """Get only project-specific news"""
    try:
        project_news = await news_service.get_user_project_news(user_id)
        return project_news
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch project news.")

@app.get("/api/news/market")
async def get_market_news():
    """Get only market news"""
    try:
        market_news = await news_service.get_live_market_news()
        return market_news
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch market news.")
    

@app.get("/api/ai/recommendations")
async def get_ai_recommendations(user_id: str = Depends(get_current_user_id)):
    """
    Acts as an AI Scout. Scans for recent trigger events and uses the LLM
    to generate a strategic investment thesis for each potential target.
    """
    try:
        # Step 1: Find recent "trigger" events from the last 30 days
        # In a real app, this would be more sophisticated
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        events_res = supabase.table('events').select('*, companies(*)').gte('event_date', thirty_days_ago).limit(5).execute()

        if not events_res.data:
            return []

        # Step 2: Asynchronously generate a thesis for each triggered company
        async def generate_thesis(client, event):
            company = event.get('companies')
            if not company: return None
            try:
                # Create a "briefing packet" for the AI
                briefing = f"Company Profile: {json.dumps(company)}\nTrigger Event: {event['summary']}"
                prompt = f"""Instruction: You are a senior M&A partner. Based on the company profile and the recent trigger event, generate a concise, professional investment thesis for why this company might be an attractive acquisition target. Respond ONLY with a JSON object in the format {{\"headline\": \"<A compelling one-sentence headline>\", \"rationale\": \"<A 2-3 sentence rationale>\"}}.

Context:\n{briefing}

Response (JSON object only):
"""
                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "synergyai-specialist", "prompt": prompt, "stream": False},
                    timeout=60.0
                )
                response.raise_for_status()
                
                ai_response_text = response.json().get('response', '{}')
                ai_thesis = json.loads(re.search(r'\{.*\}', ai_response_text, re.DOTALL).group(0))

                return {
                    "company": company,
                    "triggerEvent": {"type": event['event_type'], "summary": event['summary']},
                    "aiThesis": ai_thesis
                }
            except Exception as e:
                print(f"Error generating thesis for {company.get('name')}: {e}")
                return None

        async with httpx.AsyncClient() as client:
            tasks = [generate_thesis(client, event) for event in events_res.data]
            results = await asyncio.gather(*tasks)

        return [res for res in results if res is not None]

    except Exception as e:
        print(f"Error generating AI recommendations: {e}")
        raise HTTPException(status_code=500, detail="Could not generate AI recommendations.")



class LiveMarketData:
    def __init__(self):
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
    
    async def get_live_indices(self):
        """Get real-time Indian market data using yfinance"""
        try:
            # Indian market indices and forex
            nifty = yf.Ticker("^NSEI")
            sensex = yf.Ticker("^BSESN") 
            usdinr = yf.Ticker("INR=X")
            india_vix = yf.Ticker("^INDIAVIX")
            
            # Get latest daily data
            nifty_hist = nifty.history(period="2d")
            sensex_hist = sensex.history(period="2d")
            usdinr_hist = usdinr.history(period="2d")
            vix_hist = india_vix.history(period="2d")
            
            indicators = []
            
            # NIFTY 50
            if not nifty_hist.empty and len(nifty_hist) >= 2:
                current = nifty_hist['Close'].iloc[-1]
                previous = nifty_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "NIFTY 50",
                    "value": f"{current:,.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct > 0)  # Convert to Python bool
                })
            else:
                indicators.append({"name": "NIFTY 50", "value": "24,150.75", "change": "+0.85%", "isPositive": True})
            
            # BSE SENSEX
            if not sensex_hist.empty and len(sensex_hist) >= 2:
                current = sensex_hist['Close'].iloc[-1]
                previous = sensex_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "BSE SENSEX",
                    "value": f"{current:,.2f}",
                    "change": f"{change_pct:+.2f}%", 
                    "isPositive": bool(change_pct > 0)  # Convert to Python bool
                })
            else:
                indicators.append({"name": "BSE SENSEX", "value": "79,890.10", "change": "+0.91%", "isPositive": True})
            
            # USD/INR
            if not usdinr_hist.empty and len(usdinr_hist) >= 2:
                current = usdinr_hist['Close'].iloc[-1]
                previous = usdinr_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "USD/INR",
                    "value": f"{current:.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct > 0)  # Convert to Python bool
                })
            else:
                indicators.append({"name": "USD/INR", "value": "83.55", "change": "-0.12%", "isPositive": False})
            
            # India VIX
            if not vix_hist.empty and len(vix_hist) >= 2:
                current = vix_hist['Close'].iloc[-1]
                previous = vix_hist['Close'].iloc[-2]
                change_pct = ((current - previous) / previous) * 100
                indicators.append({
                    "name": "India VIX",
                    "value": f"{current:.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isPositive": bool(change_pct < 0)  # Convert to Python bool
                })
            else:
                indicators.append({"name": "India VIX", "value": "14.20", "change": "+2.5%", "isPositive": False})
            
            return indicators
            
        except Exception as e:
            print(f"Live market data error: {e}")
            return self.get_fallback_indicators()
    
    def get_fallback_indicators(self):
        """Fallback when live data fails"""
        return [
            {"name": "NIFTY 50", "value": "24,150.75", "change": "+0.85%", "isPositive": True},
            {"name": "BSE SENSEX", "value": "79,890.10", "change": "+0.91%", "isPositive": True},
            {"name": "USD/INR", "value": "83.55", "change": "-0.12%", "isPositive": False},
            {"name": "India VIX", "value": "14.20", "change": "+2.5%", "isPositive": False}
        ]

    async def get_live_top_movers(self, mover_type: str):
        """Get real top gainers/losers from Indian markets"""
        try:
            # Major Indian stocks for M&A relevance
            indian_stocks = {
                'RELIANCE': 'RELIANCE.NS',
                'TCS': 'TCS.NS', 
                'HDFC BANK': 'HDFCBANK.NS',
                'INFOSYS': 'INFY.NS',
                'HUL': 'HINDUNILVR.NS',
                'ITC': 'ITC.NS',
                'SBI': 'SBIN.NS',
                'BHARTI AIRTEL': 'BHARTIARTL.NS',
                'KOTAK BANK': 'KOTAKBANK.NS',
                'LT': 'LT.NS',
                'ADANI ENTERPRISES': 'ADANIENT.NS',
                'BAJAJ FINANCE': 'BAJFINANCE.NS',
                'WIPRO': 'WIPRO.NS',
                'AXIS BANK': 'AXISBANK.NS',
                'MARUTI': 'MARUTI.NS'
            }
            
            movers = []
            for name, ticker in indian_stocks.items():
                try:
                    stock = yf.Ticker(ticker)
                    hist = stock.history(period="2d")
                    
                    if len(hist) >= 2:
                        prev_close = hist['Close'].iloc[-2]
                        current_close = hist['Close'].iloc[-1]
                        change_percent = ((current_close - prev_close) / prev_close) * 100
                        
                        # Get company logo from database if available
                        company_res = supabase.table('companies').select('logo_url').ilike('name', f'%{name}%').limit(1).execute()
                        logo_url = company_res.data[0]['logo_url'] if company_res.data else None
                        
                        movers.append({
                            "name": name,
                            "ticker": ticker.replace('.NS', ''),
                            "changePercent": round(change_percent, 2),
                            "currentPrice": round(current_close, 2),
                            "logoUrl": logo_url
                        })
                except Exception as e:
                    print(f"Error fetching {name}: {e}")
                    continue
            
            # Sort and filter based on mover type
            if mover_type == "gainers":
                gainers = sorted([m for m in movers if m['changePercent'] > 0], key=lambda x: x['changePercent'], reverse=True)[:5]
                return gainers if gainers else self.get_fallback_gainers()
            else:
                losers = sorted([m for m in movers if m['changePercent'] < 0], key=lambda x: x['changePercent'])[:5]
                return losers if losers else self.get_fallback_losers()
                
        except Exception as e:
            print(f"Error fetching {mover_type}: {e}")
            return self.get_fallback_gainers() if mover_type == "gainers" else self.get_fallback_losers()
    
    def get_fallback_gainers(self):
        return [
            {"name": "RELIANCE", "changePercent": 2.5, "currentPrice": 2850.75, "logoUrl": None},
            {"name": "TCS", "changePercent": 1.8, "currentPrice": 3850.20, "logoUrl": None},
            {"name": "INFOSYS", "changePercent": 1.2, "currentPrice": 1650.50, "logoUrl": None}
        ]
    
    def get_fallback_losers(self):
        return [
            {"name": "ITC", "changePercent": -1.5, "currentPrice": 450.25, "logoUrl": None},
            {"name": "SBI", "changePercent": -0.8, "currentPrice": 780.60, "logoUrl": None},
            {"name": "HUL", "changePercent": -0.3, "currentPrice": 2450.80, "logoUrl": None}
        ]

# Initialize market data service
market_data = LiveMarketData()

async def generate_sector_trend(client: httpx.AsyncClient, sector: str) -> Dict:
    """Uses RAG and the LLM to generate a trend summary for a single sector."""
    try:
        # Find relevant context for this sector from our document library
        rag_context = rag_system.search(f"What are the recent trends, challenges, and opportunities in the {sector} sector in India?", k=3)
        context_text = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context])
        
        prompt = f"Instruction: You are a senior market analyst. Based on the provided context, write a concise, one-sentence summary of the current trend for the {sector} sector.\n\nContext:\n{context_text}\n\nResponse:"
        
        response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}, timeout=60.0)
        response.raise_for_status()
        
        trend = response.json().get('response', f'Analysis for {sector} is ongoing.').strip()
        return {"sector": sector, "trend": trend}
    except Exception as e:
        print(f"Error generating trend for {sector}: {e}")
        return {"sector": sector, "trend": "AI analysis for this sector is currently unavailable."}

@app.get("/api/intelligence/market")
async def get_market_intelligence(user_id: str = Depends(get_current_user_id)):
    """
    Generates a complete market intelligence briefing with LIVE data.
    """
    try:
        # --- 1. LIVE Market Indicators ---
        indicators = await market_data.get_live_indices()

        # --- 2. LIVE Top Gainers/Losers ---
        top_gainers = await market_data.get_live_top_movers("gainers")
        top_losers = await market_data.get_live_top_movers("losers")

        # --- 3. AI Sector Trends (Live Data + AI) ---
        sectors_res = supabase.table('companies').select('industry->>sector').not_.is_('industry->>sector', None).execute()
        distinct_sectors = list(set([item['sector'] for item in sectors_res.data if item.get('sector')]))[:3]

        sector_trends = []
        if distinct_sectors:
            async with httpx.AsyncClient() as client:
                tasks = [generate_sector_trend(client, sector) for sector in distinct_sectors]
                sector_trends = await asyncio.gather(*tasks)
        else:
            # Fallback sectors if none in database
            fallback_sectors = ["Technology", "Financial Services", "Healthcare"]
            async with httpx.AsyncClient() as client:
                tasks = [generate_sector_trend(client, sector) for sector in fallback_sectors]
                sector_trends = await asyncio.gather(*tasks)

        return {
            "indicators": indicators,
            "sectorTrends": sector_trends,
            "topGainers": top_gainers,
            "topLosers": top_losers,
            "lastUpdated": datetime.now().isoformat(),
            "dataSource": "live"
        }

    except Exception as e:
        print(f"Error fetching market intelligence: {e}")
        # Fallback to ensure the endpoint always returns data
        return {
            "indicators": market_data.get_fallback_indicators(),
            "sectorTrends": [{"sector": "Market", "trend": "Data temporarily unavailable"}],
            "topGainers": market_data.get_fallback_gainers(),
            "topLosers": market_data.get_fallback_losers(),
            "lastUpdated": datetime.now().isoformat(),
            "dataSource": "fallback"
        }


@app.get("/api/projects/{project_id}/intelligence")
async def get_project_intelligence(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Builds a complete intelligence briefing for a project, including project news,
    competitor news, and AI-generated strategic recommendations.
    """
    try:
        # Step 1: Get the project's target company
        project_res = supabase.table('projects').select('company_cin, companies(name)').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        target_cin = project_res.data['company_cin']
        target_name = project_res.data['companies']['name']

        # Step 2: Fetch news for the target company
        project_news_res = supabase.table('events').select('*').eq('company_cin', target_cin).order('event_date', desc=True).limit(10).execute()
        project_news = [{ "id": str(e['id']), "priority": e.get('severity', 'Low'), "title": e['summary'], "source": e.get('source_url', 'Internal'), "timestamp": str(e['event_date']), "companyName": target_name, "url": e.get('source_url') } for e in project_news_res.data]

        # Step 3: Fetch news for competitors
        competitors_res = supabase.table('company_relationships').select('target_company_name').eq('source_company_cin', target_cin).eq('relationship_type', 'Competitor').execute()
        competitor_names = [c['target_company_name'] for c in competitors_res.data]
        
        competitor_news = []
        if competitor_names:
            comp_cin_res = supabase.table('companies').select('cin, name').in_('name', competitor_names).execute()
            comp_cin_map = {c['name']: c['cin'] for c in comp_cin_res.data}
            if comp_cin_map:
                comp_events_res = supabase.table('events').select('*, companies(name)').in_('company_cin', list(comp_cin_map.values())).order('event_date', desc=True).limit(10).execute()
                competitor_news = [{ "id": str(e['id']), "priority": e.get('severity', 'Low'), "title": e['summary'], "source": e.get('source_url', 'Internal'), "timestamp": str(e['event_date']), "companyName": e['companies']['name'], "url": e.get('source_url') } for e in comp_events_res.data if e.get('companies')]

        # Step 4: Generate AI Recommendations (Live AI Call)
        briefing = f"Recent News for Target ({target_name}):\n" + "\n".join([f"- {n['title']}" for n in project_news[:3]])
        prompt = f"Instruction: You are a senior M&A analyst. Based on the recent news for the target company, generate two distinct, actionable, strategic recommendations for the deal team. Respond ONLY with a JSON object in the format [{{'headline': '<...>', 'rationale': '<...>', 'recommendation': '<...'}}].\n\nContext:\n{briefing}\n\nResponse (JSON array only):"
        
        ai_recommendations = []
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post("http://localhost:11434/api/generate", json={"model": "synergyai-specialist", "prompt": prompt, "stream": False})
                response.raise_for_status()
                ai_response_text = response.json().get('response', '[]')
                cleaned_json_text = re.search(r'\[.*\]', ai_response_text, re.DOTALL).group(0)
                ai_recommendations = json.loads(cleaned_json_text)
        except Exception as ai_e:
            print(f"AI Recommendation generation failed: {ai_e}")
            ai_recommendations = [{"headline": "AI Analysis Pending", "rationale": "The AI is processing market data.", "recommendation": "Review news manually."}]
        
        return { "projectNews": project_news, "competitorNews": competitor_news, "aiRecommendations": ai_recommendations }

    except Exception as e:
        print(f"Error fetching project intelligence: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch project intelligence.")


@app.get("/api/projects/{project_id}/insights/industry")
async def get_industry_updates(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Generates a complete industry intelligence briefing for the project's target company,
    combining database queries and AI-driven analysis.
    """
    try:
        # Step 1: Get the project's target company and its industry
        project_res = supabase.table('projects').select('companies(cin, name, industry)').eq('id', project_id).single().execute()
        if not project_res.data or not project_res.data.get('companies'):
            raise HTTPException(status_code=404, detail="Project or target company not found.")
        
        company = project_res.data['companies']
        industry = company.get('industry', {})
        sector = industry.get('sector', 'Unknown')
        sub_sector = industry.get('sub_sector', 'Unknown')

        # Step 2: Generate AI Market Trends Analysis using RAG
        print(f"--- RAG: Searching for market trends for {sector} sector... ---")
        rag_context_chunks = rag_system.search(f"Current M&A trends, growth projections, and key challenges for the '{sector}' sector in India.", k=3)
        context_text = "\n\n---\n\n".join([c['content'] for c in rag_context_chunks])
        
        prompt = f"Instruction: You are a senior M&A analyst. Based on the provided context, provide a detailed analysis of the current market trends for the '{sector}' sector. Use markdown for formatting.\n\nContext:\n{context_text}\n\nResponse:"
        
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
            market_trends = response.json().get('response', 'AI analysis for this sector is currently unavailable.').strip()

        # Step 3: Fetch relevant industry news and competitor activity from the 'events' table
        events_res = supabase.table('events').select('*').limit(20).execute()
        
        # This is a simplified filter. A production system would use more advanced NLP to match events to sectors.
        industry_news = [{
            "id": str(e['id']),
            "title": e['summary'],
            "source": e.get('source_url', 'Internal'),
            "timestamp": str(e['event_date'])
        } for e in events_res.data if sector.lower() in e['summary'].lower()]
        
        return {
            "sector": sector,
            "subSector": sub_sector,
            "marketTrends": market_trends,
            "industryNews": industry_news,
            "regulatoryUpdates": [], # Placeholder for now - would require a dedicated data source
            "competitorActivity": [] # Placeholder for now - would require more complex competitor mapping
        }

    except Exception as e:
        print(f"Error fetching industry updates: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch industry updates.")



@app.get("/api/projects/{project_id}/ai_summary")
async def get_project_ai_summary(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Generates a complete AI briefing for a project by synthesizing structured data,
    unstructured documents (RAG), and recent events.
    """
    try:
        # Step 1: Get the project's target company data
        project_res = supabase.table('projects').select('company_cin, companies(*)').eq('id', project_id).single().execute()
        if not project_res.data or not project_res.data.get('companies'):
            raise HTTPException(status_code=404, detail="Project or target company not found.")
        
        company = project_res.data['companies']
        target_cin = company['cin']
        target_name = company['name']

        # Step 2: Get recent critical events for the target
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        events_res = supabase.table('events').select('summary').eq('company_cin', target_cin).in_('severity', ['Critical', 'High']).gte('event_date', thirty_days_ago).order('event_date', desc=True).limit(3).execute()
        recent_events = [event['summary'] for event in events_res.data]

        # Step 3: Get qualitative insights from VDR documents via RAG
        rag_context_chunks = rag_system.search(f"Find the most important strengths, weaknesses, opportunities, and threats for {target_name}", k=5)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        # Step 4: Create the "Master Briefing Packet" for the AI
        briefing = f"""
        Company Profile: {json.dumps(company.get('financial_summary'))}
        Recent Critical Events: {json.dumps(recent_events)}
        Insights from Documents: {rag_context}
        """
        prompt = f"""Instruction: You are a senior M&A partner. Based on the provided data, generate a complete AI summary for an acquisition of {target_name}. Your response MUST be a single, valid JSON object with the following exact structure: {{\"executiveSummary\": \"<Detailed multi-paragraph summary using markdown>\", \"keyStrengths\": [\"<Strength 1>\", \"<Strength 2>\"], \"keyRisks\": [\"<Risk 1>\", \"<Risk 2>\"]}}.

Context:
{briefing}

Response (JSON object only):
"""
        # Step 5: Call the AI and parse the response robustly
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        cleaned_json_text = re.search(r'\{.*\}', ai_response_text, re.DOTALL).group(0)
        ai_summary = json.loads(cleaned_json_text)

        # Step 6: Combine AI summary with key structured data
        financial_summary = company.get('financial_summary', {})
        final_briefing = {
            **ai_summary,
            "keyData": {
                "revenue": financial_summary.get('revenue_cr'),
                "ebitdaMargin": financial_summary.get('ebitda_margin_pct'),
                "roe": financial_summary.get('roe_pct')
            }
        }
        
        return final_briefing

    except Exception as e:
        print(f"Error generating project AI summary: {e}")
        raise HTTPException(status_code=500, detail="Could not generate project AI summary.")


class TeamInvite(BaseModel):
    email: str
    role: str # 'Editor' or 'Viewer'

async def get_project_member_auth(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Verifies that the current user is a member of the project (Admin or Editor).
    This is used for read-only operations.
    """
    try:
        res = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).single().execute()
        if not res.data: # If the user is not in the table for this project
            raise HTTPException(status_code=403, detail="Forbidden: User is not a member of this project.")
        return user_id # Success
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Could not verify project membership.")

# This is the original, strict security check for WRITING data
async def get_project_admin_auth(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Verifies that the current user is an ADMIN of the project.
    This is used for write operations like inviting or revoking.
    """
    try:
        res = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).single().execute()
        if not res.data or res.data['role'] != 'Admin':
            raise HTTPException(status_code=403, detail="Forbidden: User is not an admin of this project.")
        return user_id # Success
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Could not verify project permissions.")


@app.get("/api/projects/{project_id}/team", response_model=List[Dict])
async def get_project_team(project_id: str, user_id: str = Depends(get_project_member_auth)): # Now uses member auth
    """Fetches all team members for a specific project."""
    try:
        result = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch team members.")

@app.get("/api/projects/{project_id}/invitations")
async def get_project_invitations(project_id: str, user_id: str = Depends(get_project_member_auth)): # <-- FIX #2: Uses the new, less strict check
    """Fetches all pending invitations for a specific project. Accessible by any team member."""
    try:
        result = supabase.table('project_invitations').select('*').eq('project_id', project_id).eq('status', 'Pending').order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch invitations.")

@app.post("/api/projects/{project_id}/team/invite")
async def invite_team_member(project_id: str, invite_data: TeamInvite, admin_id: str = Depends(get_project_admin_auth)): # <-- Correctly uses strict check
    """Invites a new member. Only callable by a project admin."""
    try:
        # Find the user to invite by their email
        user_res = supabase.table('users').select('id').eq('email', invite_data.email).single().execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail=f"User with email '{invite_data.email}' not found.")
        
        member_id = user_res.data['id']

        # Add the user to the project_members table
        supabase.table('project_members').insert({
            'project_id': project_id,
            'user_id': member_id,
            'role': invite_data.role
        }).execute()

        return {"message": f"User {invite_data.email} invited successfully."}
    except Exception as e:
        # This handles cases where the user is already on the team (violates primary key)
        if "duplicate key" in str(e):
            raise HTTPException(status_code=409, detail="User is already a member of this project.")
        raise HTTPException(status_code=500, detail="Could not invite team member.")

@app.get("/api/projects/{project_id}/roles")
async def get_project_roles(project_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Returns the defined roles and their specific permissions for the project.
    For this professional demo, we serve a detailed, hardcoded configuration.
    """
    try:
        # In a real enterprise app, this would be read from a database table.
        # For our resume project, providing this rich, structured data from the API
        # is a professional and impressive approach.
        roles_config = [
            {
                "name": "Admin",
                "description": "Full control over the project, including managing team members and project settings.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "Full"},
                    {"feature": "Analytics & Risk", "access": "Full"},
                    {"feature": "Valuation Models", "access": "Full"},
                    {"feature": "Reports & Memos", "access": "Full"},
                    {"feature": "Team Management", "access": "Full"}
                ]
            },
            {
                "name": "Editor",
                "description": "Can create and edit content within the project, but cannot manage team members.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "Edit"},
                    {"feature": "Analytics & Risk", "access": "View Only"},
                    {"feature": "Valuation Models", "access": "Edit"},
                    {"feature": "Reports & Memos", "access": "Edit"},
                    {"feature": "Team Management", "access": "None"}
                ]
            },
            {
                "name": "Viewer",
                "description": "Can only view existing content within the project. Cannot upload, edit, or delete.",
                "permissions": [
                    {"feature": "VDR Documents", "access": "View Only"},
                    {"feature": "Analytics & Risk", "access": "View Only"},
                    {"feature": "Valuation Models", "access": "View Only"},
                    {"feature": "Reports & Memos", "access": "View Only"},
                    {"feature": "Team Management", "access": "None"}
                ]
            }
        ]
        return roles_config

    except Exception as e:
        print(f"Error fetching roles: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch role permissions.")


class TeamInvite(BaseModel):
    email: str
    role: str # 'Editor' or 'Viewer'

# A dependency to check if the current user is an admin of the project
async def get_project_admin_auth(project_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        res = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).single().execute()
        if not res.data or res.data['role'] != 'Admin':
            raise HTTPException(status_code=403, detail="Forbidden: User is not an admin of this project.")
        return user_id
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Could not verify project permissions.")

@app.get("/api/projects/{project_id}/team", response_model=List[Dict])
async def get_project_team(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetches all team members for a specific project."""
    try:
        result = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch team members.")

@app.post("/api/projects/{project_id}/team/invite")
async def invite_team_member(project_id: str, invite_data: TeamInvite, admin_id: str = Depends(get_project_admin_auth)):
    """Invites a new member and creates a record in the invitations table."""
    try:
        # This now creates an invitation record instead of directly adding a member.
        result = supabase.table('project_invitations').insert({
            'project_id': project_id,
            'invited_by_user_id': admin_id,
            'invited_email': invite_data.email,
            'role': invite_data.role
        }).execute()
        
        # In a real app, this would also trigger the invitation email.
        return {"message": f"Invitation sent to {invite_data.email} successfully."}
    except Exception as e:
        if "duplicate key" in str(e):
            raise HTTPException(status_code=409, detail="An invitation for this email is already pending.")
        raise HTTPException(status_code=500, detail="Could not send invitation.")

@app.get("/api/projects/{project_id}/invitations")
async def get_project_invitations(project_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """Fetches all pending invitations for a specific project. Admin only."""
    try:
        result = supabase.table('project_invitations').select('*').eq('project_id', project_id).eq('status', 'Pending').order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch invitations.")

@app.post("/api/invitations/{invitation_id}/resend")
async def resend_invitation(invitation_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """Simulates resending an invitation. Admin only."""
    print(f"Resending invitation {invitation_id}")
    return {"message": "Invitation resent successfully."}


@app.delete("/api/invitations/{invitation_id}")
async def revoke_invitation(invitation_id: str, admin_id: str = Depends(get_project_admin_auth)): # <-- Correctly uses strict check
    """Revokes a pending invitation. Admin only."""
    try:
        # Instead of deleting, we update the status to 'Revoked' to maintain an audit trail.
        result = supabase.table('project_invitations').update({'status': 'Revoked'}).eq('id', invitation_id).execute()
        return {"message": "Invitation revoked successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not revoke invitation.")


# Add these endpoints to your FastAPI backend
class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None

class ProjectUserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    project_role: str
    avatar_url: Optional[str] = None

# Add these endpoints to your existing FastAPI app
@app.get("/api/user/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str = Depends(get_current_user_id)):
    """
    Get current user's profile data for global sidebar
    """
    try:
        print(f"🔍 Fetching user profile for user_id: {user_id}")
        
        # First, let's check what columns actually exist in the users table
        # Get user data from public.users table - only request columns that exist
        result = supabase.table('users').select('id, name, email').eq('id', user_id).execute()
        print(f"🔍 Users table result: {result}")
        
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            print(f"🔍 User data from database: {user_data}")
            
            return UserProfileResponse(
                id=user_data.get('id', user_id),
                name=user_data.get('name', 'User'),
                email=user_data.get('email', 'user@email.com'),
                avatar_url=None  # This column doesn't exist, so set to None
            )
        else:
            # If no user record found in public.users table, check auth metadata
            print("⚠️ No user record found in public.users table, checking auth...")
            try:
                # Get auth header to fetch user from auth
                from fastapi import Request
                # We'll need to modify the function signature to include request
                # For now, let's just return basic data
                return UserProfileResponse(
                    id=user_id,
                    name="User", 
                    email="user@email.com",
                    avatar_url=None
                )
            except Exception as auth_error:
                print(f"❌ Auth fallback failed: {auth_error}")
                return UserProfileResponse(
                    id=user_id,
                    name="User",
                    email="user@email.com",
                    avatar_url=None
                )
        
    except Exception as e:
        print(f"❌ Error fetching user profile: {e}")
        # Fallback response
        return UserProfileResponse(
            id=user_id,
            name="User",
            email="user@email.com",
            avatar_url=None
        )
    
@app.get("/api/projects/{project_id}/user-profile", response_model=ProjectUserProfileResponse)
async def get_project_user_profile(
    project_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """
    Get current user's profile with project-specific role for project sidebar
    """
    try:
        print(f"🔍 Fetching project user profile for user_id: {user_id}, project_id: {project_id}")
        
        # Get user profile data (without avatar_url since it doesn't exist)
        user_result = supabase.table('users').select('name, email').eq('id', user_id).execute()
        profile_data = user_result.data[0] if user_result.data else {}
        
        # Get project role
        try:
            role_result = supabase.rpc('get_user_project_role', {
                'p_user_id': user_id,
                'p_project_id': project_id
            }).execute()
            
            print(f"🔍 Role result: {role_result}")
            
            project_role = "Member"  # Default role
            
            if role_result.data and len(role_result.data) > 0:
                project_role = role_result.data[0].get('role', 'Member')
        except Exception as role_error:
            print(f"⚠️ Role fetch error, using default: {role_error}")
            project_role = "Member"
        
        # Get name from available sources
        name = (
            profile_data.get('name') or 
            "User"  # Fallback since we can't access auth metadata without token
        )
        
        email = profile_data.get('email') or "user@email.com"
        
        print(f"🔍 Final project profile - Name: {name}, Email: {email}, Role: {project_role}")
        
        return ProjectUserProfileResponse(
            id=user_id,
            name=name,
            email=email,
            project_role=project_role,
            avatar_url=None  # Set to None since column doesn't exist
        )
        
    except Exception as e:
        print(f"❌ Error fetching project user profile: {e}")
        # Fallback to basic data
        try:
            # Try to get basic user data from users table
            user_result = supabase.table('users').select('name, email').eq('id', user_id).execute()
            if user_result.data:
                user_data = user_result.data[0]
                return ProjectUserProfileResponse(
                    id=user_id,
                    name=user_data.get('name', 'User'),
                    email=user_data.get('email', 'user@email.com'),
                    project_role="Member",
                    avatar_url=None
                )
        except:
            pass
        
        # Ultimate fallback
        return ProjectUserProfileResponse(
            id=user_id,
            name="User",
            email="user@email.com",
            project_role="Member",
            avatar_url=None
        )