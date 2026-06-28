import json
import re
import urllib.parse
import asyncio
import time
import uuid
import httpx
import numpy as np
from io import BytesIO
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Union
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ReportLab imports for PDF export
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph

from app.core.config import supabase, OLLAMA_SERVER_URL, CUSTOM_MODEL_NAME
from app.core.security import get_current_user_id, get_project_member_auth, get_project_admin_auth
from app.core.cache_decorator import cached
from rag_pipeline import rag_system
from app.services.news import news_service
from app.services.market import market_data, generate_sector_trend
from app.services.prompt_templates import (
    format_rag_context,
    create_briefing_cards,
    create_executive_summary_fallback,
    create_valuation_fallback,
    create_synergy_fallback,
    create_risk_fallback,
    create_strategic_fallback,
    create_recommendation_fallback,
    create_comprehensive_fallback_memo,
    get_comprehensive_fallback_memo
)

router = APIRouter(tags=["AI & Analytics"])



class AIQuery(BaseModel):
    question: str
    project_id: Optional[str] = None

class StrategicQuery(BaseModel):
    query: str

class AI_Summary_Export(BaseModel):
    narrative: str
    project_name: str

class SimulationRunRequest(BaseModel):
    variables: Dict

class DraftCreate(BaseModel):
    template_id: str
    template_name: str

class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None
    status: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: str

class ProjectStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class ProjectStatusHistory(BaseModel):
    id: str
    old_status: str
    new_status: str
    changed_by_user_name: str
    reason: Optional[str]
    created_at: str

class DeleteConfirmation(BaseModel):
    projectName: str

class NoteUpdate(BaseModel):
    title: str
    content: str

class NoteSearchQuery(BaseModel):
    query: str

class AiLabRequest(BaseModel):
    note_ids: List[str]
    action: str  # 'summarize', 'find_themes', etc.

class ChatSession(BaseModel):
    project_id: Optional[str] = None
    messages: List[Dict] = []

STATUS_OPTIONS = ["Sourcing", "Diligence", "Negotiation", "Completed"]

async def get_ai_json_response(prompt: str, retries: int = 3) -> Union[Dict, List]:
    """A robust function to get a JSON response from the LLM, with retries."""
    for attempt in range(retries):
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
                response.raise_for_status()
            ai_response_text = response.json().get('response', '{}')
            match = re.search(r'(\{.*\}|\[.*\])', ai_response_text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception as e:
            print(f"AI JSON generation attempt {attempt + 1} failed: {e}")
    raise HTTPException(status_code=500, detail="Failed to get a valid JSON response from the AI model.")

def parse_strategic_query(query: str):
    """Extract structured filters from natural language query."""
    filters = {}
    revenue_match = re.search(r'revenue (?:greater than|>)\s*[₹]?\s*(\d+)', query, re.IGNORECASE)
    if revenue_match: 
        filters['revenue_min'] = int(revenue_match.group(1))
    
    locations = ['maharashtra', 'karnataka', 'delhi', 'gurgaon', 'mumbai', 'bengaluru', 'chennai', 'noida']
    query_lower = query.lower()
    for loc in locations:
        if loc in query_lower:
            filters['hq_state'] = loc
            break
    return filters

async def score_and_stream(candidates: List[Dict], user_query: str):
    """Scores companies in parallel and streams the results."""
    yield json.dumps({"type": "status", "message": f"Analyzing {len(candidates)} candidates..."}) + "\n"

    async def score_company(client, company):
        try:
            company_dossier = f"Name: {company.get('name')}, Sector: {company.get('industry', {}).get('sector')}, Revenue (Cr): {company.get('financial_summary', {}).get('revenue_cr')}"
            prompt = f"Instruction: You are an M&A analyst. Based on the User's Goal, provide a 'Strategic Fit Score' (0-100) and a brief rationale. Respond ONLY with a JSON object like {{\"fitScore\": <score>, \"rationale\": \"<text>\"}}.\n\nUser's Strategic Goal: \"{user_query}\"\n\nCompany Data:\n{company_dossier}\n\nResponse (JSON only):"
            
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False},
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

@router.post("/api/ai/query")
async def handle_ai_query(query: AIQuery):
    """General AI Query utilizing RAG and custom LLM."""
    try:
        print(f"--- RAG: Searching for context for question: '{query.question}' ---")
        context_chunks = rag_system.search(query.question)
        
        if not context_chunks:
            context_text = "No relevant context was found in the document library for this query."
        else:
            context_text = "\n\n---\n\n".join([chunk['content'] for chunk in context_chunks])

        prompt = f"Instruction: {query.question}\n\nContext: {context_text}\n\nResponse:"
        
        print("--- Sending prompt to SynergyAI Specialist model via Ollama... ---")
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
        
        return {"answer": final_answer, "sources": context_chunks}

    except httpx.RequestError as e:
        print(f"❌ HTTP Error: Could not connect to Ollama server. Is it running?")
        return {"answer": "AI service is currently unreachable. Please ensure Ollama is running.", "sources": []}
    except httpx.HTTPStatusError as e:
        print(f"❌ Ollama returned an error (possibly Out Of Memory due to parallel requests): {e}")
        return {"answer": "The AI model encountered an error (likely out of memory). If this persists, try reducing OLLAMA_NUM_PARALLEL.", "sources": []}
    except Exception as e:
        print(f"❌ An error occurred in the AI query pipeline: {e}")
        return {"answer": "An internal error occurred while processing your query.", "sources": []}

@router.post("/api/companies/strategic_search")
async def strategic_search(query: StrategicQuery):
    """Performs strategic deal sourcing match search and streams results."""
    print(f"--- Received Strategic Search Query: '{query.query}' ---")
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

    return StreamingResponse(score_and_stream(candidates, query.query), media_type="application/x-ndjson")

@router.get("/api/dashboard/narrative")
@cached(request_type="ai_heavy")
async def get_narrative(user_id: str = Depends(get_current_user_id)):
    """Generates pipeline briefing narrative using RAG."""
    try:
        projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        projects = projects_res.data
        deal_count = len(projects)
        
        rag_context_chunks = rag_system.search("Summarize the overall strategic initiatives, management outlook, and key identified risks from across all documents.", k=5)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        briefing = f"Total Active Deals: {deal_count}\n\nQualitative Insights from Documents:\n{rag_context}"
        prompt = f"Instruction: You are a senior M&A analyst. Based on the following context, write a detailed, insightful, multi-paragraph executive summary of the current deal pipeline. Use markdown bolding (**word**) to highlight all key metrics and important phrases.\n\nContext: {briefing}\n\nResponse:"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
        
        ai_response = response.json()
        narrative = ai_response.get('response', 'Could not generate summary.').strip()
        return {"narrative": narrative}

    except Exception as e:
        print(f"Error generating AI narrative: {e}")
        raise HTTPException(status_code=500, detail="Could not generate AI narrative.")

@router.post("/api/export/summary_pdf")
async def export_summary_pdf(data: AI_Summary_Export):
    """Generates a professional PDF from AI narrative."""
    try:
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        p.setFont("Helvetica-Bold", 16)
        p.drawString(30, height - 50, "SynergyAI - AI Pipeline Summary")
        p.setFont("Helvetica", 10)
        p.drawString(30, height - 65, f"Project Context: {data.project_name}")
        p.line(30, height - 75, width - 30, height - 75)

        styles = getSampleStyleSheet()
        styleN = styles['BodyText']
        styleN.fontName = 'Helvetica'
        styleN.fontSize = 11
        cleaned_narrative = data.narrative.replace("**", "")
        p_text = Paragraph(cleaned_narrative, styleN)
        
        p_text.wrapOn(p, width - 60, height - 100)
        p_text.drawOn(p, 30, height - 100 - p_text.height)

        p.setFont("Helvetica-Oblique", 8)
        p.drawString(30, 40, f"Generated by SynergyAI on {time.strftime('%Y-%m-%d')}")
        
        p.showPage()
        p.save()
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=SynergyAI_Pipeline_Summary.pdf"
        })

    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF.")

@router.get("/api/projects/{project_id}/risk_profile")
@cached(request_type="ai_heavy")
async def get_project_risk_profile(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Generates a complete, AI-driven risk profile for the target company."""
    try:
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        company_cin = project_res.data['company_cin']
        
        company_res = supabase.table('companies').select('name').eq('cin', company_cin).single().execute()
        company_name = company_res.data['name'] if company_res.data else 'Unknown Company'

        print("--- RAG: Searching for all risk-related context in VDR... ---")
        rag_context_chunks = rag_system.search(
            "Find all text related to risks, liabilities, litigation, dependencies, competition, and challenges.", 
            k=10
        )
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        prompt = f"""Instruction: You are a senior M&A risk analyst. Create a risk profile for the acquisition of '{company_name}'. Based ONLY on the provided context, generate a JSON object with the structure: {{\"overallScore\": <0-100>, \"topRisks\": [{{\"risk\": \"<Identified Risk>\", \"mitigation\": \"<Suggested Mitigation>\"}}], \"detailedBreakdown\": [{{\"category\": \"<Category>\", \"score\": <0-100>, \"insights\": [\"<Insight 1>\"]}}]}}.

        Context from VDR Documents:
        {rag_context}

        Response (JSON object only):
        """
                
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                OLLAMA_SERVER_URL,
                json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        cleaned_json_text = re.search(r'\{.*\}', ai_response_text, re.DOTALL).group(0)
        risk_profile_data = json.loads(cleaned_json_text)

        risk_profile_data['id'] = company_cin
        risk_profile_data['name'] = company_name
        
        return risk_profile_data

    except Exception as e:
        print(f"Error generating risk profile: {e}")
        raise HTTPException(status_code=500, detail="Could not generate risk profile.")

@router.get("/api/projects/{project_id}/synergy_score")
@cached(request_type="ai_heavy")
async def get_synergy_ai_score(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Strategic fit and synergy scoring."""
    try:
        project_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        project = next((p for p in project_res.data if p['id'] == project_id), None)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied.")

        print(f"--- RAG: Searching for strategic context for {project['name']}... ---")
        rag_query = f"Analyze the strategic rationale, market position, and potential risks for an acquisition of {project['targetCompany']['name']} based on all available documents."
        rag_context_chunks = rag_system.search(rag_query, k=10)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        prompt = f"""Instruction: You are the head of a top-tier M&A investment committee. Conduct a final Strategic Fit Audit for the potential acquisition of {project['targetCompany']['name']}. Based ONLY on the provided context, generate a JSON object with the following structure: {{"overallScore": <0-100>, "subScores": [{{"category": "<Category>", "score": <0-100>, "summary": "<One-sentence summary>"}}], "rationale": "<A detailed, multi-paragraph analysis>"}}.

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
                OLLAMA_SERVER_URL,
                json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        
        try:
            final_audit = json.loads(ai_response_text)
            if "overallScore" not in final_audit:
                raise ValueError("Missing overallScore")
        except json.JSONDecodeError:
            try:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', ai_response_text, re.DOTALL)
                if json_match:
                    cleaned_json_text = json_match.group(0)
                    final_audit = json.loads(cleaned_json_text)
                else:
                    cleaned_text = re.sub(r'^[^{]*', '', ai_response_text)
                    cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
                    cleaned_text = re.sub(r',\s*}', '}', cleaned_text)
                    cleaned_text = re.sub(r',\s*]', ']', cleaned_text)
                    final_audit = json.loads(cleaned_text)
                
                if "overallScore" not in final_audit:
                    raise ValueError("Missing overallScore")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"JSON parsing failed, fallback used: {e}")
                final_audit = {
                    "overallScore": 50,
                    "subScores": [
                        {"category": "Financial Synergy", "score": 70, "summary": "Moderate financial synergy potential based on available data"},
                        {"category": "Strategic Fit", "score": 80, "summary": "Good strategic alignment with current portfolio"},
                        {"category": "Risk Profile", "score": 65, "summary": "Moderate risk profile requiring careful due diligence"}
                    ],
                    "rationale": "Unable to generate AI analysis due to technical issues. Please try again."
                }
        
        return final_audit

    except Exception as e:
        print(f"Error generating SynergyAI Score: {e}")
        fallback_response = {
            "overallScore": 50,
            "subScores": [
                {"category": "Financial Synergy", "score": 65, "summary": "Analysis unavailable - service error"},
                {"category": "Strategic Fit", "score": 70, "summary": "Analysis unavailable - service error"},
                {"category": "Risk Profile", "score": 65, "summary": "Analysis unavailable - service error"}
            ],
            "rationale": f"Unable to generate complete analysis due to: {str(e)}."
        }
        return fallback_response

@router.get("/api/projects/{project_id}/knowledge_graph")
async def get_knowledge_graph(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Builds corporate relationship networks for target entity."""
    try:
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        
        target_cin = project_res.data['company_cin']
        nodes = {}
        links = []

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

        try:
            relationships_res = supabase.table('company_relationships')\
                .select('*')\
                .eq('source_company_cin', target_cin)\
                .execute()
            
            for rel in relationships_res.data or []:
                rel_type = rel.get('relationship_type', '')
                target_company_cin = rel.get('target_company_cin')
                rel_name = rel.get('target_company_name', 'Unknown Company')
                
                rel_id = target_company_cin if target_company_cin else f"rel_{rel_type}_{rel_name.replace(' ', '_').lower()}"
                normalized_type = rel_type.lower().strip()
                
                category_map = {
                    'competitor': 'Competitor', 'subsidiary': 'Subsidiary', 'partner': 'Partner',
                    'parent': 'Subsidiary', 'supplier': 'Partner', 'customer': 'Partner',
                    'rival': 'Competitor', 'subsidiaries': 'Subsidiary', 'competitors': 'Competitor',
                    'partners': 'Partner'
                }
                category = category_map.get(normalized_type, 'Partner')
                if category == 'Partner':
                    if 'competitor' in normalized_type or 'rival' in normalized_type:
                        category = 'Competitor'
                    elif 'subsidiary' in normalized_type:
                        category = 'Subsidiary'
                
                company_value = category
                if target_company_cin:
                    try:
                        company_res = supabase.table('companies').select('name, financial_summary').eq('cin', target_company_cin).single().execute()
                        if company_res.data:
                            company = company_res.data
                            rel_name = company.get('name', rel_name)
                            revenue = company.get('financial_summary', {}).get('revenue_cr', 0) if company.get('financial_summary') else 0
                            if revenue:
                                company_value = f"Revenue: ₹{revenue:,} Cr"
                    except:
                        pass

                if rel_id not in nodes:
                    symbol_sizes = {
                        'Competitor': 60, 'Subsidiary': 50, 'Partner': 55, 'Executive': 40, 'Target': 80
                    }
                    symbol_size = symbol_sizes.get(category, 50)
                    
                    nodes[rel_id] = {
                        "id": rel_id, "name": rel_name, "category": category, "symbolSize": symbol_size, "value": company_value
                    }
                links.append({"source": target_cin, "target": rel_id})
        except Exception as e:
            print(f"Warning: Error fetching relationships: {e}")

        categories_present = set(node['category'] for node in nodes.values())
        categories = [{'name': cat} for cat in categories_present]

        return {"nodes": list(nodes.values()), "links": links, "categories": categories}

    except Exception as e:
        print(f"Error generating knowledge graph: {e}")
        raise HTTPException(status_code=500, detail="Could not generate knowledge graph.")

@router.get("/api/projects/{project_id}/alerts")
async def get_project_alerts(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    priorities: Optional[str] = Query(None),
    types: Optional[str] = Query(None)
):
    """Fetches alerts / events log for the target company."""
    try:
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found.")
        target_cin = project_res.data['company_cin']

        query_builder = supabase.table('events').select('*').eq('company_cin', target_cin)

        if priorities:
            priority_list = [p.strip() for p in priorities.split(',')]
            query_builder = query_builder.in_('severity', priority_list)
        if types:
            type_list = [t.strip() for t in types.split(',')]
            query_builder = query_builder.in_('event_type', type_list)

        result = query_builder.order('event_date', desc=True).limit(50).execute()

        alerts = []
        for event in result.data:
            if event is None:
                continue
            details = event.get('details') or {}
            description = details.get('summary') if details else event.get('summary', 'No description available')
            
            alerts.append({
                "id": event.get('id', 'unknown'),
                "priority": event.get('severity', 'Low'),
                "title": event.get('summary', 'No title'),
                "type": event.get('event_type', 'Unknown'),
                "source": event.get('source_url', 'Internal'),
                "timestamp": event.get('event_date', 'N/A'),
                "description": description,
                "aiInsight": "AI insight generation for this alert is pending."
            })
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not fetch alerts: {str(e)}")

@router.get("/api/projects/{project_id}/valuation/templates")
async def get_project_valuation_templates(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Default templates list."""
    try:
        return [
            {'id': 'dcf', 'name': 'Discounted Cash Flow (DCF)', 'description': 'Project future cash flows and discount them.', 'lastUsed': '2 days ago', 'thumbnailUrl': '/thumbnails/dcf.png', 'projectId': project_id},
            {'id': 'lbo', 'name': 'Leveraged Buyout (LBO)', 'description': 'Model leverage transaction to determine IRR.', 'lastUsed': '1 week ago', 'thumbnailUrl': '/thumbnails/lbo.png', 'projectId': project_id},
            {'id': 'cca', 'name': 'Comparable Company Analysis', 'description': 'Value target relative to peers.', 'lastUsed': '5 days ago', 'thumbnailUrl': '/thumbnails/comps.png', 'projectId': project_id},
            {'id': 'pt', 'name': 'Precedent Transactions', 'description': 'Analyze past M&A target deals.', 'lastUsed': '1 month ago', 'thumbnailUrl': '/thumbnails/precedents.png', 'projectId': project_id}
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch project templates")

@router.get("/api/projects/{project_id}/simulations")
async def get_project_simulations(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Lists Monte Carlo valuations."""
    try:
        result = supabase.table('valuation_simulations').select('id, name, variables, results_summary').eq('project_id', project_id).eq('user_id', user_id).order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch simulations.")

@router.post("/api/projects/{project_id}/simulations/run")
async def run_monte_carlo(project_id: str, sim_request: SimulationRunRequest, user_id: str = Depends(get_current_user_id)):
    """Executes a Monte Carlo distribution model."""
    try:
        project_access = supabase.table('project_members').select('*').eq('project_id', project_id).eq('user_id', user_id).execute()
        if not project_access.data:
            raise HTTPException(status_code=403, detail="No access to this project")
        
        vars = sim_request.variables
        iterations = int(vars.get('iterations', 10000))
        
        rev_growth = np.random.normal(vars.get('revenueGrowth', 0), 2.0, iterations)
        ebitda_margin = np.random.normal(vars.get('ebitdaMargin', 0), 5.0, iterations)
        cost_of_capital = np.random.normal(vars.get('costOfCapital', 0), 1.0, iterations)
        
        terminal_cash_flow = 100 * (1 + rev_growth / 100) * (ebitda_margin / 100)
        discount_rate = (cost_of_capital / 100 - (rev_growth / 100 * 0.5))
        discount_rate[discount_rate <= 0] = 0.01
        terminal_values = terminal_cash_flow / discount_rate
        
        mean_val = np.mean(terminal_values)
        median_val = np.median(terminal_values)
        std_dev = np.std(terminal_values)
        p5 = np.percentile(terminal_values, 5)
        p95 = np.percentile(terminal_values, 95)

        results_summary = f"Mean Valuation: {mean_val:.2f} Cr, 90% Confidence Interval: [{p5:.2f} Cr - {p95:.2f} Cr], Median: {median_val:.2f} Cr"
        prompt = f"Instruction: You are a quantitative analyst. Based on the following Monte Carlo simulation results, write a concise, one-paragraph rationale explaining the key takeaways for an investment committee. Use markdown bolding.\n\nContext:\n{results_summary}\n\nResponse:"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            ai_rationale = response.json().get('response', 'Analysis pending.').strip()

        return {
            "meanValuation": mean_val, "medianValuation": median_val, "stdDeviation": std_dev,
            "confidenceInterval90": [p5, p95], "distribution": terminal_values.tolist(), "aiRationale": ai_rationale
        }
    except Exception as e:
        print(f"Error running simulation: {e}")
        raise HTTPException(status_code=500, detail="Could not run Monte Carlo simulation.")

@router.post("/api/projects/{project_id}/simulations")
async def save_simulation(project_id: str, simulation_data: dict, user_id: str = Depends(get_current_user_id)):
    """Save simulation configuration and summary metrics."""
    try:
        result = supabase.table('valuation_simulations').insert({
            'project_id': project_id, 'user_id': user_id, 'name': simulation_data['name'],
            'variables': simulation_data['variables'], 'results_summary': simulation_data.get('results_summary')
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save simulation.")

@router.get("/api/projects/{project_id}/simulations/{simulation_id}")
async def get_simulation(project_id: str, simulation_id: str, user_id: str = Depends(get_current_user_id)):
    """Get single Monte Carlo simulation."""
    try:
        result = supabase.table('valuation_simulations').select('*').eq('project_id', project_id).eq('id', simulation_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch simulation")

@router.put("/api/projects/{project_id}/simulations/{simulation_id}")
async def update_simulation(project_id: str, simulation_id: str, simulation_data: dict, user_id: str = Depends(get_current_user_id)):
    """Update simulation parameters."""
    try:
        result = supabase.table('valuation_simulations').update({
            'name': simulation_data['name'], 'variables': simulation_data['variables'],
            'results_summary': simulation_data.get('results_summary'), 'last_run_at': 'now()'
        }).eq('project_id', project_id).eq('id', simulation_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not update simulation")

@router.delete("/api/projects/{project_id}/simulations/{simulation_id}")
async def delete_simulation(project_id: str, simulation_id: str, user_id: str = Depends(get_current_user_id)):
    """Deletes simulation."""
    try:
        supabase.table('valuation_simulations').delete().eq('project_id', project_id).eq('id', simulation_id).eq('user_id', user_id).execute()
        return {"message": "Simulation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not delete simulation")

@router.get("/api/projects/{project_id}/scenarios")
async def get_project_scenarios(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get valuation scenarios."""
    try:
        result = supabase.table('valuation_scenarios').select('*').eq('project_id', project_id).eq('user_id', user_id).order('created_at', desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch scenarios.")

@router.get("/api/projects/{project_id}/scenarios/{scenario_id}")
async def get_scenario(project_id: str, scenario_id: str, user_id: str = Depends(get_current_user_id)):
    """Get single valuation scenario details."""
    try:
        result = supabase.table('valuation_scenarios').select('*').eq('project_id', project_id).eq('id', scenario_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch scenario")

@router.post("/api/projects/{project_id}/scenarios")
async def create_scenario(project_id: str, scenario_data: dict, user_id: str = Depends(get_current_user_id)):
    """Create valuation scenario."""
    try:
        result = supabase.table('valuation_scenarios').insert({
            'project_id': project_id, 'user_id': user_id, 'name': scenario_data['name'],
            'variables': scenario_data['variables'], 'summary': scenario_data.get('summary', '')
        }).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create scenario")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not create scenario")

@router.put("/api/projects/{project_id}/scenarios/{scenario_id}")
async def update_scenario(project_id: str, scenario_id: str, scenario_data: dict, user_id: str = Depends(get_current_user_id)):
    """Update valuation scenario details."""
    try:
        result = supabase.table('valuation_scenarios').update({
            'name': scenario_data['name'], 'variables': scenario_data['variables'], 'summary': scenario_data.get('summary', '')
        }).eq('project_id', project_id).eq('id', scenario_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not update scenario")

@router.delete("/api/projects/{project_id}/scenarios/{scenario_id}")
async def delete_scenario(project_id: str, scenario_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete valuation scenario."""
    try:
        supabase.table('valuation_scenarios').delete().eq('project_id', project_id).eq('id', scenario_id).eq('user_id', user_id).execute()
        return {"message": "Scenario deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not delete scenario")

@router.get("/api/projects/{project_id}/generate_memo")
@cached(request_type="ai_heavy")
async def generate_one_click_memo(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Generates detailed investment memos compiling VDR intelligence."""
    try:
        mission_control_data = await get_mission_control_data(project_id, user_id)
        if not mission_control_data:
            raise HTTPException(status_code=404, detail="Project data not available")
        
        risk_profile, synergy_score = await asyncio.gather(
            get_project_risk_profile(project_id, user_id),
            get_synergy_ai_score(project_id, user_id)
        )
        
        project = mission_control_data["project"]
        key_metrics = mission_control_data["keyMetrics"]
        ai_recommendation = mission_control_data["aiRecommendation"]
        
        company_name = project.get('companies', {}).get('name', 'Target Company')
        project_name = project.get('name', 'Investment Analysis')

        common_context = f"""
PROJECT OVERVIEW:
- Target Company: {company_name}
- Project: {project_name}
- Industry: {project.get('companies', {}).get('industry', {}).get('sector', 'N/A')}

KEY METRICS:
- AI Recommendation: {ai_recommendation.get('recommendation', 'ANALYZE')} ({ai_recommendation.get('confidence', 'Medium')} Confidence)
- Risk Score: {risk_profile.get('overallScore', 'N/A')}/100
- Synergy Score: {synergy_score.get('overallScore', 'N/A')}/100
- Valuation Range: {key_metrics['financial']['valuation']}
- Revenue: {key_metrics['financial']['revenue']}
- EBITDA Margin: {key_metrics['financial']['ebitdaMargin']}
- Employees: {key_metrics['financial']['employees']}
"""
        section_tasks = [
            generate_section(
                section_name="Executive Summary",
                prompt=f"Write a comprehensive executive summary for the acquisition of {company_name}. Focus on investment thesis, key metrics, and recommendation. {common_context}",
                fallback=create_executive_summary_fallback(company_name, ai_recommendation, key_metrics)
            ),
            generate_section(
                section_name="Valuation Analysis", 
                prompt=f"Write a detailed valuation analysis for {company_name}. Include DCF methodology and CCA. {common_context}",
                fallback=create_valuation_fallback(company_name, key_metrics)
            ),
            generate_section(
                section_name="Synergy Assessment",
                prompt=f"Write synergy assessment for {company_name}. Synergy Details: {synergy_score} {common_context}",
                fallback=create_synergy_fallback(company_name, synergy_score)
            ),
            generate_section(
                section_name="Risk Assessment",
                prompt=f"Write risk assessment for {company_name}. Risk Details: {risk_profile} {common_context}",
                fallback=create_risk_fallback(company_name, risk_profile)
            ),
            generate_section(
                section_name="Strategic Rationale", 
                prompt=f"Write strategic rationale for acquiring {company_name}. {common_context}",
                fallback=create_strategic_fallback(company_name)
            ),
            generate_section(
                section_name="Recommendations",
                prompt=f"Write recommendations for {company_name}. {common_context}",
                fallback=create_recommendation_fallback(company_name, ai_recommendation)
            )
        ]
        
        results = await asyncio.gather(*section_tasks)
        
        sections = {
            "executiveSummary": results[0],
            "valuationSection": results[1],
            "synergySection": results[2],
            "riskSection": results[3],
            "strategicRationale": results[4],
            "recommendationSection": results[5]
        }

        professional_memo = {
            "projectName": project_name,
            "targetCompany": company_name,
            "lastUpdated": datetime.utcnow().isoformat(),
            "dataSources": ["mission_control", "risk_analysis", "synergy_scoring", "market_data"],
            "briefingCards": create_briefing_cards(ai_recommendation, key_metrics, risk_profile, synergy_score, company_name),
            **sections
        }
        return professional_memo
    except Exception as e:
        print(f"Error generating memo: {e}")
        return get_comprehensive_fallback_memo(project_id, user_id)

async def generate_section(section_name: str, prompt: str, fallback: str) -> str:
    """Generate a single memo section text."""
    try:
        full_prompt = f"Instruction: You are a senior M&A analyst. {prompt}\n\nRespond with ONLY the content for this section, no markdown headers or formatting wrappers."
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": full_prompt, "stream": False})
            response.raise_for_status()
        content = response.json().get('response', '').strip()
        return content if content and len(content) > 100 else fallback
    except Exception:
        return fallback

@router.get("/api/projects/{project_id}/key_risks")
@cached(request_type="ai_heavy")
async def get_project_key_risks(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Deep analysis of legal and financial risks in VDR documents."""
    try:
        project_res = supabase.table('projects').select('companies(name)').eq('id', project_id).single().execute()
        target_name = project_res.data['companies']['name'] if project_res.data and project_res.data.get('companies') else "the target company"

        docs_res = supabase.table('vdr_documents').select('file_name').eq('project_id', project_id).execute()
        allowed_filenames = [doc['file_name'] for doc in docs_res.data]
        if not allowed_filenames:
            return []

        rag_context_chunks = rag_system.search(f"Find all text related to risks, liabilities, litigation, dependencies, competition, challenges, and negative sentiment for {target_name}", k=15, allowed_sources=allowed_filenames)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        prompt = f"""Instruction: You are a senior M&A risk analyst. Based ONLY on the provided context, identify key risks. Response must be a single JSON array of objects like: [{{\"category\": \"Financial|Legal|Operational\", \"severity\": <0-100>, \"risk\": \"...\", \"mitigation\": \"...\", \"evidence\": [\"quote\"]}}].

Context from VDR Documents:
{rag_context}

Response (JSON array only):
"""
        return await get_ai_json_response(prompt)
    except Exception as e:
        print(f"Error generating key risks: {e}")
        raise HTTPException(status_code=500, detail="Could not generate AI-powered key risks.")

@router.get("/api/projects/{project_id}/tasks")
@cached(request_type="ai_heavy")
async def get_project_tasks(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get project tasks."""
    try:
        # Import dynamically to prevent cyclic dependencies
        from app.routers.ai import get_project_tasks as get_tasks
        return await get_tasks(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch tasks.")

async def get_project_tasks(project_id: str) -> list:
    """Helper to query project_tasks table."""
    try:
        tasks_res = supabase.table('project_tasks').select('*').eq('project_id', project_id).execute()
        return tasks_res.data or []
    except Exception:
        return [
            {"id": "1", "title": "Complete financial due diligence", "description": "Review balance sheet and target audit checks", "status": "To Do", "priority": "High"},
            {"id": "2", "title": "Schedule management meeting", "description": "Arrange alignment meeting with target execs", "status": "To Do", "priority": "Medium"}
        ]

@router.post("/api/projects/{project_id}/generate_tasks")
async def generate_ai_tasks(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Suggests checklist tasks for Kanban board using VDR insights."""
    try:
        docs_res = supabase.table('vdr_documents').select('file_name').eq('project_id', project_id).execute()
        allowed_filenames = [doc['file_name'] for doc in docs_res.data]
        
        rag_context_chunks = []
        if allowed_filenames:
            rag_context_chunks = rag_system.search(f"Find all text related to risks, mitigations, dependencies, and next steps for this project.", k=10, allowed_sources=allowed_filenames)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        prompt = f"""Instruction: You are a senior M&A project manager. Based ONLY on the provided context, generate a JSON array of 3-5 critical next steps: [{{\"title\": \"...\", \"description\": \"...\", \"priority\": \"High|Medium|Low\"}}].

Context:
{rag_context}

Response (JSON array only):
"""
        ai_tasks_data = await get_ai_json_response(prompt)
        
        for task in ai_tasks_data:
            supabase.table('project_tasks').insert({
                'project_id': project_id, 'created_by_user_id': user_id, 'title': task['title'],
                'description': task['description'], 'priority': task['priority'], 'status': 'To Do'
            }).execute()
        return {"message": f"{len(ai_tasks_data)} AI-suggested tasks added."}
    except Exception as e:
        print(f"Error generating AI tasks: {e}")
        raise HTTPException(status_code=500, detail="Could not generate AI-suggested tasks.")

@router.put("/api/tasks/{task_id}/status")
async def update_task_status(task_id: str, payload: TaskStatusUpdate, user_id: str = Depends(get_current_user_id)):
    """Kanban task status updates."""
    try:
        supabase.table('project_tasks').update({'status': payload.status}).eq('id', task_id).execute()
        return {"message": "Task status updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not update task status.")

@router.get("/api/projects/{project_id}/mission_control")
@cached(request_type="ai_heavy")
async def get_mission_control_data(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Mission Control deal tracker compiler."""
    try:
        # Import dynamically here to avoid circular dependencies
        from app.main import warm_critical_project_caches, warm_all_project_caches
        await warm_critical_project_caches(project_id, user_id)
        asyncio.create_task(warm_all_project_caches(project_id, user_id))
        
        project_res = supabase.table('projects').select('id, name, created_by_user_id, company_cin, companies(name, industry, financial_summary)').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_data = project_res.data
        company_data = project_data.get('companies', {})
        
        team_res = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
        team_members = team_res.data if team_res.data else []
        
        financials = await calculate_financial_metrics(company_data.get('financial_summary', {}))
        risk_indicators = await calculate_risk_indicators(project_data.get('company_cin'))
        synergies = await calculate_synergy_potential(financials)
        tasks = await get_project_tasks(project_id)
        ai_recommendation = await generate_ai_recommendation(project_data, financials, risk_indicators, synergies)
        
        return {
            "project": {
                "id": project_data['id'], "name": project_data['name'], "status": "Active",
                "companies": company_data, "team": team_members
            },
            "keyMetrics": {
                "financial": {
                    "revenue": f"₹{financials.get('revenue_cr', 0):.1f}Cr",
                    "ebitdaMargin": f"{financials.get('ebitda_margin', 0)}%",
                    "valuation": f"₹{financials.get('valuation_low', 0):.0f}-{financials.get('valuation_high', 0):.0f}Cr",
                    "employees": f"{financials.get('employee_count', 0):,}"
                },
                "dealHealth": {
                    "riskScore": f"{risk_indicators.get('risk_score', 50)}/100",
                    "riskLevel": risk_indicators.get('risk_level', 'Medium'),
                    "synergyScore": f"{synergies.get('synergy_score', 50)}/100",
                    "synergyValue": f"₹{synergies.get('synergy_potential_cr', 0):.1f}Cr"
                },
                "execution": {
                    "taskCompletion": "0%", "milestoneProgress": "0%",
                    "highPriorityTasks": len([t for t in tasks if t.get('priority') == 'High'])
                }
            },
            "aiRecommendation": ai_recommendation,
            "nextActions": tasks[:3],
            "upcomingMilestones": [],
            "riskIndicators": {
                "criticalEvents": risk_indicators.get('critical_events', 0),
                "financialHealth": financials.get('financial_health', 'Moderate'),
                "dealComplexity": risk_indicators.get('deal_complexity', 'Medium')
            },
            "lastUpdated": datetime.utcnow().isoformat(),
            "dataSources": ["company_financials", "events", "market_data"]
        }
    except Exception as e:
        print(f"Error in Mission Control analytics: {e}")
        return get_fallback_mission_control(project_id, user_id)

async def calculate_financial_metrics(financial_summary: dict) -> dict:
    try:
        revenue = float(financial_summary.get('revenue_cr', 0))
        ebitda = float(financial_summary.get('ebitda_cr', 0))
        net_income = float(financial_summary.get('net_income_cr', 0))
        employee_count = int(financial_summary.get('employee_count', 0))
        
        ebitda_margin = (ebitda / revenue * 100) if revenue > 0 else 0
        roe = (net_income / revenue * 100) if revenue > 0 else 0
        valuation_low = revenue * 1.5
        valuation_high = revenue * 3.0
        
        financial_health = "Strong" if ebitda_margin > 20 else "Moderate" if ebitda_margin > 10 else "Weak"
        return {
            "revenue_cr": revenue, "ebitda_cr": ebitda, "ebitda_margin": round(ebitda_margin, 1),
            "roe": round(roe, 1), "employee_count": employee_count, "valuation_low": round(valuation_low, 2),
            "valuation_high": round(valuation_high, 2), "financial_health": financial_health
        }
    except Exception:
        return {"revenue_cr": 0, "ebitda_cr": 0, "ebitda_margin": 0, "employee_count": 0, "valuation_low": 0, "valuation_high": 0, "financial_health": "Unknown"}

async def calculate_risk_indicators(company_cin: str) -> dict:
    try:
        if not company_cin:
            return {"risk_score": 50, "risk_level": "Medium", "critical_events": 0, "deal_complexity": "Medium"}
        
        thirty_days_ago = (datetime.utcnow() - timedelta(days=90)).isoformat()
        events_res = supabase.table('events').select('severity, event_type').eq('company_cin', company_cin).gte('event_date', thirty_days_ago).execute()
        events = events_res.data or []
        critical_events = len([e for e in events if e.get('severity') in ['Critical', 'High']])
        
        event_risk = min(critical_events * 15, 60)
        base_risk = 20
        total_risk_score = min(event_risk + base_risk, 100)
        
        risk_level = "High" if total_risk_score > 70 else "Medium" if total_risk_score > 40 else "Low"
        return {"risk_score": total_risk_score, "risk_level": risk_level, "critical_events": critical_events, "deal_complexity": risk_level}
    except Exception:
        return {"risk_score": 50, "risk_level": "Medium", "critical_events": 0, "deal_complexity": "Medium"}

async def calculate_synergy_potential(financials: dict) -> dict:
    try:
        revenue = financials.get('revenue_cr', 0)
        ebitda = financials.get('ebitda_cr', 0)
        ebitda_margin = financials.get('ebitda_margin', 0)
        
        cost_synergies = ebitda * 0.12
        revenue_synergies = revenue * 0.04
        total_synergies = cost_synergies + revenue_synergies
        
        synergy_score = min(100, (total_synergies / revenue) * 200) if revenue > 0 else 50
        margin_bonus = max(0, (ebitda_margin - 10) / 2)
        synergy_score = min(100, synergy_score + margin_bonus)
        
        return {
            "synergy_score": round(synergy_score, 1), "synergy_potential_cr": round(total_synergies, 2),
            "cost_synergies": round(cost_synergies, 2), "revenue_synergies": round(revenue_synergies, 2),
            "value_driver": "Cost Reduction" if cost_synergies > revenue_synergies else "Revenue Growth"
        }
    except Exception:
        return {"synergy_score": 50, "synergy_potential_cr": 0, "cost_synergies": 0, "revenue_synergies": 0, "value_driver": "Analysis Pending"}

async def generate_ai_recommendation(project_data: dict, financials: dict, risks: dict, synergies: dict) -> dict:
    try:
        context = f"Project: {project_data.get('name')}\nTarget: {project_data.get('companies', {}).get('name')}\nRevenue ₹{financials.get('revenue_cr')}Cr, EBITDA {financials.get('ebitda_margin')}%\nRisk Score {risks.get('risk_score')}/100, Synergy Score {synergies.get('synergy_score')}/100\nValuation Range ₹{financials.get('valuation_low')}-{financials.get('valuation_high')}Cr"
        prompt = f"Instruction: As a senior M&A analyst, provide a concise investment recommendation. Respond with ONLY JSON object: {{\"recommendation\": \"BUY|HOLD|SELL\", \"confidence\": \"High|Medium|Low\", \"rationale\": \"brief explanation\"}}\n\nContext:\n{context}\n\nResponse:"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
        ai_response = response.json().get('response', '{}')
        return json.loads(re.search(r'\{.*\}', ai_response, re.DOTALL).group(0))
    except Exception:
        risk_score = risks.get('risk_score', 50)
        synergy_score = synergies.get('synergy_score', 50)
        if synergy_score > 65 and risk_score < 40:
            return {"recommendation": "BUY", "confidence": "High", "rationale": "Strong synergies with manageable risk profile"}
        elif synergy_score > 55 and risk_score < 60:
            return {"recommendation": "BUY", "confidence": "Medium", "rationale": "Good synergy potential with moderate risks"}
        return {"recommendation": "HOLD", "confidence": "Medium", "rationale": "Further due diligence recommended"}

def get_fallback_mission_control(project_id: str, user_id: str) -> dict:
    return {
        "project": {"id": project_id, "name": "Project Analysis", "status": "Active", "companies": {"name": "Target Company"}, "team": []},
        "keyMetrics": {
            "financial": {"revenue": "₹0.0Cr", "ebitdaMargin": "0%", "valuation": "₹0-0Cr", "employees": "0"},
            "dealHealth": {"riskScore": "50/100", "riskLevel": "Medium", "synergyScore": "50/100", "synergyValue": "₹0.0Cr"},
            "execution": {"taskCompletion": "0%", "milestoneProgress": "0%", "highPriorityTasks": 0}
        },
        "aiRecommendation": {"recommendation": "HOLD", "confidence": "Medium", "rationale": "Data analysis in progress"},
        "nextActions": [], "upcomingMilestones": [],
        "riskIndicators": {"criticalEvents": 0, "financialHealth": "Unknown", "dealComplexity": "Medium"},
        "lastUpdated": datetime.utcnow().isoformat(), "dataSources": ["fallback"]
    }

@router.get("/api/projects/{project_id}/status/options")
async def get_status_options():
    return STATUS_OPTIONS

@router.put("/api/projects/{project_id}/status")
async def update_project_status(
    project_id: str, 
    status_update: ProjectStatusUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Updates deal status stage."""
    try:
        if status_update.status not in STATUS_OPTIONS:
            raise HTTPException(status_code=400, detail=f"Invalid status. Options: {STATUS_OPTIONS}")
        member_check = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).execute()
        if not member_check.data:
            raise HTTPException(status_code=403, detail="No access to project")

        current_project = supabase.table('projects').select('status').eq('id', project_id).single().execute()
        if not current_project.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        current_status = current_project.data.get('status', 'Sourcing')
        new_status = status_update.status
        if current_status == new_status:
            return {"message": "Status unchanged", "status": current_status}

        result = supabase.table('projects').update({'status': new_status, 'updated_at': 'now()', 'last_status_update_by': user_id}).eq('id', project_id).execute()
        supabase.table('project_status_history').insert({'project_id': project_id, 'old_status': current_status, 'new_status': new_status, 'changed_by_user_id': user_id, 'reason': status_update.reason}).execute()
        
        return {"message": f"Project status updated to {new_status}", "old_status": current_status, "new_status": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/projects/{project_id}/status/history")
async def get_status_history(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get history log of status stages."""
    try:
        member_check = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).execute()
        if not member_check.data:
            raise HTTPException(status_code=403, detail="No access to project")

        result = supabase.table('project_status_history').select('id, old_status, new_status, reason, created_at, users:changed_by_user_id(name)').eq('project_id', project_id).order('created_at', desc=True).execute()
        return [{
            "id": i['id'], "old_status": i['old_status'], "new_status": i['new_status'],
            "changed_by_user_name": i['users']['name'] if i.get('users') else 'Unknown User',
            "reason": i.get('reason'), "created_at": i['created_at']
        } for i in result.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/projects/{project_id}/status/current")
async def get_current_status(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Current deal stage metadata."""
    try:
        member_check = supabase.table('project_members').select('role').eq('project_id', project_id).eq('user_id', user_id).execute()
        if not member_check.data:
            raise HTTPException(status_code=403, detail="No access to project")
        result = supabase.table('projects').select('status, updated_at, last_status_update_by, users:last_status_update_by(name)').eq('id', project_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        project_data = result.data
        return {
            "status": project_data['status'], "last_updated": project_data['updated_at'],
            "last_updated_by": project_data['users']['name'] if project_data.get('users') else 'Unknown', "available_options": STATUS_OPTIONS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/projects/{project_id}/access_summary")
@cached(request_type="ai_heavy")
async def get_project_access_summary(project_id: str, user_id: str = Depends(get_project_member_auth)):
    """Count of members and admin access roles."""
    try:
        result = supabase.table('project_members').select('role', count='exact').eq('project_id', project_id).execute()
        total_members = result.count if result.count is not None else 0
        admin_count = sum(1 for m in result.data if m['role'] == 'Admin') if result.data else 0
        return {"totalMembers": total_members, "adminCount": admin_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch access summary.")

@router.put("/api/projects/{project_id}/archive")
async def archive_project(project_id: str, admin_id: str = Depends(get_project_admin_auth)):
    """Archives project."""
    try:
        supabase.table('projects').update({'status': 'Archived'}).eq('id', project_id).execute()
        return {"message": "Project has been successfully archived."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not archive project.")

@router.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, confirmation: DeleteConfirmation, admin_id: str = Depends(get_project_admin_auth)):
    """Permanently deletes project."""
    try:
        project_res = supabase.table('projects').select('name').eq('id', project_id).single().execute()
        if not project_res.data or project_res.data['name'] != confirmation.projectName:
            raise HTTPException(status_code=400, detail="Project name confirmation failed.")
        supabase.table('projects').delete().eq('id', project_id).execute()
        return {"message": "Project deleted permanently."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not delete project.")

@router.get("/api/projects/{project_id}/ai_chats")
async def get_project_ai_chats(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Get project AI chats."""
    try:
        result = supabase.table('project_ai_chats').select('id, title, messages, updated_at, created_at').eq('project_id', project_id).eq('user_id', user_id).order('updated_at', desc=True).execute()
        conversations = []
        for convo in result.data:
            try:
                messages_data = json.loads(convo['messages']) if isinstance(convo['messages'], str) else convo['messages']
            except:
                messages_data = []
            conversations.append({'id': convo['id'], 'project_id': project_id, 'title': convo['title'], 'messages': messages_data, 'updated_at': convo['updated_at']})
        return conversations
    except Exception:
        return []

@router.post("/api/projects/{project_id}/ai_chat")
async def handle_project_ai_chat(project_id: str, query: BaseModel, user_id: str = Depends(get_current_user_id)):
    """Scoped project QA co-pilot chat."""
    # Note: query will map ProjectChatQuery properties
    # Let's map dynamically to support both queries
    data_dict = query.model_dump()
    question = data_dict.get('question')
    existing_messages = data_dict.get('existing_messages', [])
    chat_id = data_dict.get('chat_id')

    try:
        project_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
        project = next((p for p in project_res.data if p['id'] == project_id), None)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        docs_res = supabase.table('vdr_documents').select('file_name').eq('project_id', project_id).execute()
        allowed_filenames = [doc['file_name'] for doc in docs_res.data]
        
        rag_context_chunks = rag_system.search(question, k=5, allowed_sources=allowed_filenames) if allowed_filenames else []
        context_text = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks]) if rag_context_chunks else "No VDR context."

        prompt = f"Instruction: You are an M&A analyst working on the acquisition of {project.get('targetCompany', {}).get('name', 'the target')}. Use context to answer. Context:\n{context_text}\nQ: {question}\nA:"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
        final_answer = response.json().get('response', '').strip()

        user_message = {"role": "user", "content": question}
        assistant_message = {"role": "assistant", "content": final_answer, "sources": rag_context_chunks}
        updated_messages = existing_messages + [user_message, assistant_message]

        if chat_id and chat_id != 'new':
            supabase.table('project_ai_chats').update({'messages': updated_messages, 'updated_at': 'now()'}).eq('id', chat_id).eq('user_id', user_id).execute()
            updated_convo = supabase.table('project_ai_chats').select('*').eq('id', chat_id).single().execute()
            if isinstance(updated_convo.data['messages'], str):
                updated_convo.data['messages'] = json.loads(updated_convo.data['messages'])
            return updated_convo.data
        else:
            title_prompt = f"Summarize project-specific Q&A in 5 words or less: Q: {question} A: {final_answer}"
            async with httpx.AsyncClient() as client:
                title_res = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": title_prompt, "stream": False})
            title = title_res.json().get('response', 'Discussion').strip().replace('"', '')

            result = supabase.table('project_ai_chats').insert({'project_id': project_id, 'user_id': user_id, 'title': title, 'messages': updated_messages}).execute()
            if isinstance(result.data[0]['messages'], str):
                result.data[0]['messages'] = json.loads(result.data[0]['messages'])
            return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/projects/{project_id}/ai_chats/{chat_id}")
async def delete_project_chat(project_id: str, chat_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        supabase.table('project_ai_chats').delete().eq('id', chat_id).eq('user_id', user_id).eq('project_id', project_id).execute()
        return {"message": "Chat deleted"}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not delete chat")

@router.get("/api/projects/{project_id}/ai_chats/{chat_id}")
async def get_single_project_chat(project_id: str, chat_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('project_ai_chats').select('id, title, messages, updated_at, created_at').eq('id', chat_id).eq('project_id', project_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Not found")
        convo = result.data[0]
        messages_data = json.loads(convo['messages']) if isinstance(convo['messages'], str) else convo['messages']
        return {'id': convo['id'], 'project_id': project_id, 'title': convo['title'], 'messages': messages_data, 'updated_at': convo['updated_at']}
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")

@router.get("/api/notes", response_model=List[Dict])
async def get_all_notes(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('notes').select('*').eq('user_id', user_id).order('updated_at', desc=True).execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch notes")

@router.post("/api/notes")
async def create_new_note(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('notes').insert({'user_id': user_id, 'title': 'New Note', 'content': ''}).execute()
        return result.data[0]
    except Exception:
        raise HTTPException(status_code=500, detail="Could not create note")

@router.put("/api/notes/{note_id}")
async def update_note(note_id: str, note_data: NoteUpdate, user_id: str = Depends(get_current_user_id)):
    try:
        # Simple summary generation
        summary_prompt = f"Write a one-sentence summary for this note content: {note_data.content}"
        async with httpx.AsyncClient() as client:
            sum_res = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": summary_prompt, "stream": False})
        ai_summary = sum_res.json().get('response', 'Analysis pending.').strip()

        supabase.table('notes').update({'title': note_data.title, 'content': note_data.content, 'summary': ai_summary, 'updated_at': 'now()'}).eq('id', note_id).eq('user_id', user_id).execute()
        return {"message": "Note updated successfully"}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not update note")

@router.delete("/api/notes/{note_id}")
async def delete_note(note_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('notes').delete().eq('id', note_id).eq('user_id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not delete note")

@router.post("/api/notes/search")
async def search_notes(search_query: NoteSearchQuery, user_id: str = Depends(get_current_user_id)):
    try:
        q = search_query.query
        results = supabase.table('notes').select('*').or_(f"title.ilike.%{q}%,content.ilike.%{q}%").eq('user_id', user_id).limit(20).execute()
        
        search_results = []
        for note in results.data:
            content = note.get('content', '')
            match_index = content.lower().find(q.lower())
            start = max(0, match_index - 70)
            end = min(len(content), match_index + 70)
            excerpt = ("..." + content[start:end].replace(q, f"<mark>{q}</mark>") + "...") if match_index != -1 else note.get('summary', '')

            search_results.append({"id": note['id'], "title": note['title'], "excerpt": excerpt, "updated_at": note['updated_at']})
        return search_results
    except Exception:
        raise HTTPException(status_code=500, detail="Search failed")

@router.post("/api/notes/ai_lab")
async def notes_ai_lab(request: AiLabRequest, user_id: str = Depends(get_current_user_id)):
    try:
        notes_res = supabase.table('notes').select('content').in_('id', request.note_ids).eq('user_id', user_id).execute()
        combined = "\n\n---\n\n".join([n.get('content', '') for n in notes_res.data])

        if not combined.strip():
            return {"action": request.action, "output": "Notes are empty."}

        if request.action == 'summarize':
            prompt = f"Instruction: Synthesize the following notes into a cohesive summary: {combined}"
            async with httpx.AsyncClient(timeout=180.0) as client:
                res = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            return {"action": "summarize", "output": res.json().get('response', '').strip()}
        elif request.action == 'find_themes':
            prompt = f"Instruction: List the top recurring themes from this content as a JSON array of strings: {combined}"
            themes = await get_ai_json_response(prompt)
            return {"action": "find_themes", "output": themes}
        return {"action": request.action, "output": "Invalid action"}
    except Exception:
        raise HTTPException(status_code=500, detail="AI Lab operation failed")

@router.get("/api/news/projects")
async def get_projects_news(user_id: str = Depends(get_current_user_id)):
    try:
        return await news_service.get_user_project_news(user_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch project news.")

@router.get("/api/news/market")
async def get_market_news():
    try:
        return await news_service.get_live_market_news()
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch market news.")
    
@router.get("/api/news/live")
async def get_live_combined_news(user_id: str = Depends(get_current_user_id)):
    try:
        market_news = await news_service.get_live_market_news()
        project_news = await news_service.get_user_project_news(user_id)
        return {"market_news": market_news, "project_news": project_news, "last_updated": datetime.now().isoformat()}
    except Exception:
        raise HTTPException(status_code=500, detail="News fetch error")

@router.get("/api/ai/recommendations")
@cached(request_type="ai_heavy")
async def get_ai_recommendations(user_id: str = Depends(get_current_user_id)):
    try:
        # Get 5 most recent events, regardless of date, to ensure demo data always works
        events_res = supabase.table('events').select('*, companies(*)').order('event_date', desc=True).limit(5).execute()
        if not events_res.data:
            return []

        async def generate_thesis(client, event):
            company = event.get('companies')
            if not company: 
                return None
            
            # Default fallback thesis
            ai_thesis = {
                "headline": f"Strategic Acquisition of {company.get('name', 'Target')}",
                "rationale": "This target aligns with core expansion objectives and provides immediate market synergy."
            }
            
            try:
                briefing = f"Profile: {json.dumps(company)}\nEvent: {event.get('summary', 'Market shift')}"
                prompt = f"Instruction: As a senior partner, write a JSON thesis for acquiring this target company: {briefing}. format: {{\"headline\": \"...\", \"rationale\": \"...\"}}"
                response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}, timeout=30.0)
                
                if response.status_code == 200:
                    text_response = response.json().get('response', '{}')
                    match = re.search(r'\{.*\}', text_response, re.DOTALL)
                    if match:
                        ai_thesis = json.loads(match.group(0))
            except Exception as e:
                print(f"Fallback used for recommendation thesis generation: {e}")
                
            return {
                "company": company, 
                "triggerEvent": {"type": event.get('event_type', 'Market Event'), "summary": event.get('summary', 'Notable industry development')}, 
                "aiThesis": ai_thesis
            }

        async with httpx.AsyncClient() as client:
            tasks = [generate_thesis(client, event) for event in events_res.data]
            results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]
    except Exception:
        raise HTTPException(status_code=500, detail="Could not generate recommendations")

@router.get("/api/intelligence/market")
@cached(request_type="ai_heavy") 
async def get_market_intelligence(user_id: str = Depends(get_current_user_id)):
    try:
        indicators = await market_data.get_live_indices()
        top_gainers = await market_data.get_live_top_movers("gainers")
        top_losers = await market_data.get_live_top_movers("losers")

        sectors_res = supabase.table('companies').select('industry->>sector').not_.is_('industry->>sector', None).execute()
        distinct_sectors = list(set([item['sector'] for item in sectors_res.data if item.get('sector')]))[:3]

        sector_trends = []
        if distinct_sectors:
            async with httpx.AsyncClient() as client:
                tasks = [generate_sector_trend(client, sector) for sector in distinct_sectors]
                sector_trends = await asyncio.gather(*tasks)
        else:
            fallback_sectors = ["Technology", "Financial Services", "Healthcare"]
            async with httpx.AsyncClient() as client:
                tasks = [generate_sector_trend(client, sector) for sector in fallback_sectors]
                sector_trends = await asyncio.gather(*tasks)

        return {"indicators": indicators, "sectorTrends": sector_trends, "topGainers": top_gainers, "topLosers": top_losers, "lastUpdated": datetime.now().isoformat(), "dataSource": "live"}
    except Exception:
        return {"indicators": market_data.get_fallback_indicators(), "sectorTrends": [{"sector": "Market", "trend": "Data temporarily unavailable"}], "topGainers": market_data.get_fallback_gainers(), "topLosers": market_data.get_fallback_losers(), "lastUpdated": datetime.now().isoformat(), "dataSource": "fallback"}

@router.get("/api/projects/{project_id}/intelligence")
@cached(request_type="ai_heavy")
async def get_project_intelligence(project_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        project_res = supabase.table('projects').select('company_cin, companies(name)').eq('id', project_id).single().execute()
        if not project_res.data:
            raise HTTPException(status_code=404, detail="Not found")
        target_cin = project_res.data['company_cin']
        target_name = project_res.data['companies']['name']

        project_news_res = supabase.table('events').select('*').eq('company_cin', target_cin).order('event_date', desc=True).limit(10).execute()
        project_news = [{ "id": str(e['id']), "priority": e.get('severity', 'Low'), "title": e['summary'], "source": e.get('source_url', 'Internal'), "timestamp": str(e['event_date']), "companyName": target_name, "url": e.get('source_url') } for e in project_news_res.data]

        competitors_res = supabase.table('company_relationships').select('target_company_name').eq('source_company_cin', target_cin).eq('relationship_type', 'Competitor').execute()
        competitor_names = [c['target_company_name'] for c in competitors_res.data]
        
        competitor_news = []
        if competitor_names:
            comp_cin_res = supabase.table('companies').select('cin, name').in_('name', competitor_names).execute()
            comp_cin_map = {c['name']: c['cin'] for c in comp_cin_res.data}
            if comp_cin_map:
                comp_events_res = supabase.table('events').select('*, companies(name)').in_('company_cin', list(comp_cin_map.values())).order('event_date', desc=True).limit(10).execute()
                competitor_news = [{ "id": str(e['id']), "priority": e.get('severity', 'Low'), "title": e['summary'], "source": e.get('source_url', 'Internal'), "timestamp": str(e['event_date']), "companyName": e['companies']['name'], "url": e.get('source_url') } for e in comp_events_res.data if e.get('companies')]

        briefing = f"Recent News for Target ({target_name}):\n" + "\n".join([f"- {n['title']}" for n in project_news[:3]])
        prompt = f"Instruction: Based on target company news, list 2 strategic recommendations for the deal team. Respond strictly with JSON array: [{{'headline': '...', 'rationale': '...', 'recommendation': '...'}}].\n\nContext:\n{briefing}\n\nResponse:"
        
        ai_recommendations = []
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
                ai_recommendations = json.loads(re.search(r'\[.*\]', response.json().get('response', '[]'), re.DOTALL).group(0))
        except:
            ai_recommendations = [{"headline": "AI Analysis Pending", "rationale": "Processing market metrics.", "recommendation": "Review news manually."}]
        
        return { "projectNews": project_news, "competitorNews": competitor_news, "aiRecommendations": ai_recommendations }
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch project intelligence")

@router.get("/api/projects/{project_id}/insights/industry")
@cached(request_type="ai_heavy")
async def get_industry_updates(project_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        project_res = supabase.table('projects').select('companies(cin, name, industry)').eq('id', project_id).single().execute()
        if not project_res.data or not project_res.data.get('companies'):
            raise HTTPException(status_code=404, detail="Not found")
        
        company = project_res.data['companies']
        industry = company.get('industry', {})
        sector = industry.get('sector', 'Unknown')
        sub_sector = industry.get('sub_sector', 'Unknown')

        rag_context_chunks = rag_system.search(f"Current M&A trends, growth projections, and key challenges for the '{sector}' sector in India.", k=3)
        context_text = "\n\n---\n\n".join([c['content'] for c in rag_context_chunks])
        
        prompt = f"Instruction: Analyze sector trends. Context:\n{context_text}\nSector: {sector}\nResponse:"
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            market_trends = response.json().get('response', 'AI analysis unavailable.').strip()

        events_res = supabase.table('events').select('*').limit(20).execute()
        industry_news = [{"id": str(e['id']), "title": e['summary'], "source": e.get('source_url', 'Internal'), "timestamp": str(e['event_date'])} for e in events_res.data if sector.lower() in e['summary'].lower()]
        
        return { "sector": sector, "subSector": sub_sector, "marketTrends": market_trends, "industryNews": industry_news, "regulatoryUpdates": [], "competitorActivity": [] }
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch industry updates")

@router.get("/api/projects/{project_id}/ai_summary")
@cached(request_type="ai_heavy")
async def get_project_ai_summary(project_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        project_res = supabase.table('projects').select('company_cin, companies(*)').eq('id', project_id).single().execute()
        if not project_res.data or not project_res.data.get('companies'):
            raise HTTPException(status_code=404, detail="Not found")
        
        company = project_res.data['companies']
        target_cin = company['cin']
        target_name = company['name']

        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        events_res = supabase.table('events').select('summary').eq('company_cin', target_cin).in_('severity', ['Critical', 'High']).gte('event_date', thirty_days_ago).order('event_date', desc=True).limit(3).execute()
        recent_events = [event['summary'] for event in events_res.data]

        rag_context_chunks = rag_system.search(f"Find the most important strengths, weaknesses, opportunities, and threats for {target_name}", k=5)
        rag_context = "\n\n---\n\n".join([chunk['content'] for chunk in rag_context_chunks])

        briefing = f"Profile: {json.dumps(company.get('financial_summary'))}\nEvents: {json.dumps(recent_events)}\nContext: {rag_context}"
        prompt = f"Instruction: Write a JSON summary for acquisition. structure: {{\"executiveSummary\": \"...\", \"keyStrengths\": [\"...\"], \"keyRisks\": [\"...\"]}}. Context: {briefing}\nResponse:"
        
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False})
            response.raise_for_status()
        
        ai_response_text = response.json().get('response', '{}')
        cleaned_json_text = re.search(r'\{.*\}', ai_response_text, re.DOTALL).group(0)
        ai_summary = json.loads(cleaned_json_text)

        financial_summary = company.get('financial_summary', {})
        return {
            **ai_summary,
            "keyData": {
                "revenue": financial_summary.get('revenue_cr'),
                "ebitdaMargin": financial_summary.get('ebitda_margin_pct'),
                "roe": financial_summary.get('roe_pct')
            }
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Could not generate project AI summary.")

@router.get("/api/chat/history")
async def get_chat_history(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('chat_conversations').select('id, title, messages, created_at, updated_at').eq('user_id', user_id).order('created_at', desc=True).execute()
        conversations = []
        for convo in result.data:
            conversations.append({'id': convo['id'], 'title': convo['title'], 'messages': convo['messages'], 'lastUpdated': convo['updated_at'] or convo['created_at']})
        return conversations
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch chat history.")

@router.post("/api/chat/history")
async def save_chat_history(session_data: ChatSession, user_id: str = Depends(get_current_user_id)):
    # Maps ChatSession properties
    data = session_data.model_dump()
    project_id = data.get('project_id')
    messages = data.get('messages', [])
    try:
        conversation_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        prompt = f"Instruction: Summarize the conversation in 5 words or less to use as a title: {conversation_text}"
        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_SERVER_URL, json={"model": CUSTOM_MODEL_NAME, "prompt": prompt, "stream": False}, timeout=30.0)
            title = response.json().get('response', 'New Chat Session').strip().replace('"', '') if response.status_code == 200 else "New Chat Session"

        result = supabase.table('chat_conversations').insert({'user_id': user_id, 'project_id': project_id, 'title': title, 'messages': messages}).execute()
        return result.data[0]
    except Exception:
        raise HTTPException(status_code=500, detail="Could not save chat history.")

@router.put("/api/chat/history/{conversation_id}")
async def update_chat_history(conversation_id: str, session_data: ChatSession, user_id: str = Depends(get_current_user_id)):
    data = session_data.model_dump()
    messages = data.get('messages', [])
    try:
        check_result = supabase.table('chat_conversations').select('id').eq('id', conversation_id).eq('user_id', user_id).execute()
        if not check_result.data:
            raise HTTPException(status_code=404, detail="Not found")
        
        supabase.table('chat_conversations').update({'messages': messages, 'updated_at': 'now()'}).eq('id', conversation_id).eq('user_id', user_id).execute()
        return {"message": "Conversation updated successfully."}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Could not update chat history.")

@router.get("/api/dashboard/chart_data")
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
        return {"bySector": [{"name": k, "value": v} for k, v in sector_counts.items()], "byStatus": [{"name": k, "value": v} for k, v in status_counts.items()]}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch chart data.")

@router.get("/api/companies/search_by_text")
def search_companies_by_text(query: Optional[str] = Query(None)):
    try:
        if not query or len(query.strip()) < 2:
            return []
        cleaned = query.strip()
        result = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary').or_(f'name.ilike.%{cleaned}%,industry->>sector.ilike.%{cleaned}%,industry->>sub_sector.ilike.%{cleaned}%').range(0, 19).execute()
        return result.data
    except Exception:
        try:
            result = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary').ilike('name', f'%{cleaned}%').range(0, 19).execute()
            return result.data
        except:
            return []

@router.get("/api/companies/filter")
def filter_companies(
    revenue_min: Optional[int] = Query(None), employee_max: Optional[int] = Query(None),
    sector: Optional[str] = Query(None), hq_state: Optional[str] = Query(None),
    ebitda_margin_min: Optional[float] = Query(None), roe_min: Optional[float] = Query(None)
):
    try:
        query_builder = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary')
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
        return result.data if result.data else []
    except Exception:
        return []

@router.get("/api/watchlists_with_counts", response_model=List[Dict])
async def get_watchlists_with_counts(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.rpc('get_user_watchlists_with_counts', {'p_user_id': user_id}).execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch watchlists with counts.")

@router.get("/api/watchlists", response_model=List[Dict])
async def get_watchlists(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('watchlists').select('id, name').eq('user_id', user_id).order('created_at').execute()
        return result.data
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch watchlists.")

@router.post("/api/watchlists")
async def create_watchlist(watchlist: dict, user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table('watchlists').insert({'user_id': user_id, 'name': watchlist['name']}).execute()
        return result.data[0]
    except Exception:
        raise HTTPException(status_code=500, detail="Could not create watchlist.")

@router.get("/api/watchlists/{watchlist_id}/companies")
async def get_watchlist_companies(watchlist_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: 
            raise HTTPException(status_code=403, detail="Forbidden")
        result = supabase.table('watchlist_companies').select('companies(*)').eq('watchlist_id', watchlist_id).execute()
        companies = [item['companies'] for item in result.data if item.get('companies')]
        companies = [c for c in companies if c is not None]
        return companies
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch companies.")

@router.post("/api/watchlists/{watchlist_id}/companies")
async def add_company_to_watchlist(watchlist_id: str, request: dict, user_id: str = Depends(get_current_user_id)):
    try:
        company_cin = request.get('company_cin')
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: 
            raise HTTPException(status_code=403, detail="Forbidden")
        supabase.table('watchlist_companies').upsert({'watchlist_id': watchlist_id, 'company_cin': company_cin, 'user_id': user_id}).execute()
        return {"message": "Company added successfully."}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not add company.")

@router.delete("/api/watchlists/{watchlist_id}/companies/{company_cin}")
async def remove_company_from_watchlist(watchlist_id: str, company_cin: str, user_id: str = Depends(get_current_user_id)):
    try:
        owner_check = supabase.table('watchlists').select('id').eq('id', watchlist_id).eq('user_id', user_id).execute()
        if not owner_check.data: 
            raise HTTPException(status_code=403, detail="Forbidden")
        supabase.table('watchlist_companies').delete().match({'watchlist_id': watchlist_id, 'company_cin': company_cin, 'user_id': user_id}).execute()
        return {"message": "Company removed successfully."}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not remove company.")

@router.get("/api/companies/market_map")
def get_market_map_data(
    sector: Optional[str] = Query(None), hq_state: Optional[str] = Query(None),
    revenue_min: Optional[int] = Query(None), growth_min: Optional[float] = Query(None),
    ebitda_margin_min: Optional[float] = Query(None), roe_min: Optional[float] = Query(None)
):
    try:
        query = supabase.table('companies').select('cin, name, logo_url, industry, financial_summary')
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

        result = query.limit(100).execute()
        map_data = []
        for company in result.data:
            fs = company.get('financial_summary', {})
            ind = company.get('industry', {})
            if all([fs, ind, fs.get('revenue_cr'), fs.get('growth_rate_pct'), fs.get('employee_count'), ind.get('sector')]):
                map_data.append({
                    'cin': company['cin'], 'name': company['name'], 'logoUrl': company.get('logo_url'),
                    'sector': ind.get('sector'), 'revenue': float(fs.get('revenue_cr', 0)),
                    'growth': float(fs.get('growth_rate_pct', 0)), 'employees': int(fs.get('employee_count', 0)),
                    'ebitdaMargin': float(fs.get('ebitda_margin_pct', 0)), 'roe': float(fs.get('roe_pct', 0))
                })
        return map_data
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch market map data.")
