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
from datetime import datetime
import tempfile
from pathlib import Path

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
@app.get("/api/projects", response_model=List[Dict])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """
    Fetches all projects the current user is a member of.
    """
    try:
        # Verify the user exists and is authenticated
        if not user_id:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # We now call our smart database function via RPC
        result = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        
        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=500, detail=result.error.message)
            
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch projects.")
    
@app.post("/api/projects")
async def create_project(project_data: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    """
    Creates a new project by calling our powerful and safe database function.
    """
    try:
        print(f"Creating project: {project_data.name}, company: {project_data.company_cin}")
        
        # Use a simpler approach if the RPC function has issues
        # Insert project directly
        project_result = supabase.table('projects').insert({
            'name': project_data.name,
            'company_cin': project_data.company_cin
        }).execute()
        
        if not project_result.data:
            raise Exception("Failed to create project")
            
        project_id = project_result.data[0]['id']
        
        # Add creator as admin
        supabase.table('project_members').insert({
            'project_id': project_id,
            'user_id': user_id,
            'role': 'Admin'
        }).execute()
        
        # Add team members
        for email in project_data.team_emails:
            # Get user by email
            user_result = supabase.table('users').select('id').eq('email', email).execute()
            if user_result.data and len(user_result.data) > 0:
                member_id = user_result.data[0]['id']
                supabase.table('project_members').insert({
                    'project_id': project_id,
                    'user_id': member_id,
                    'role': 'Editor'
                }).execute()
        
        return {
            "message": f"Project '{project_data.name}' created successfully.", 
            "project_id": project_id
        }
            
    except Exception as e:
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
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
    Performs a search across all documents within a specific project's VDR.
    Supports two modes: 'semantic' (AI-powered) and 'fulltext' (keyword-based).
    """
    try:
        # Step 1: Security - Get a list of all document IDs for this project.
        # This ensures our search is scoped only to this deal's VDR.
        # In a real app with many documents, we would pass these IDs to the RAG system.
        # For our current setup, the RAG search is global, but this is the correct pattern.
        
        print(f"--- VDR Search: Project '{project_id}', Mode: '{search_query.mode}', Query: '{search_query.query}' ---")

        if search_query.mode == 'semantic':
            # --- Semantic Search (Using our RAG "Smart Library") ---
            context_chunks = rag_system.search(search_query.query, k=10)
            
            # Format the results for the frontend
            results = []
            for chunk in context_chunks:
                # Create a highlighted excerpt
                highlighted_excerpt = chunk['content'].replace(
                    search_query.query, f"<mark>{search_query.query}</mark>"
                )
                results.append({
                    "docId": chunk.get('doc_id', chunk['source']), # Use a real ID if available
                    "docName": chunk['source'],
                    "excerpt": f"...{highlighted_excerpt}...",
                    "source": chunk['source']
                })
            return results
        
        else: # 'fulltext' search
            # --- Full-text Search (Simulated) ---
            # A professional implementation would use a tsvector on the document content in PostgreSQL.
            # For this resume project, we will simulate this by searching filenames.
            docs_res = supabase.table('vdr_documents').select('id, file_name').eq('project_id', project_id).ilike('file_name', f"%{search_query.query}%").limit(10).execute()
            
            results = [{
                "docId": doc['id'],
                "docName": doc['file_name'],
                "excerpt": "Keyword match found in document title.",
                "source": doc['file_name']
            } for doc in docs_res.data]
            return results

    except Exception as e:
        print(f"Error during VDR search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during VDR search.")
