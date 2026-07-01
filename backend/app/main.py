import sys
import io

# Force stdout/stderr to use UTF-8 encoding to prevent CP1252 crashes on Windows
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import asyncio
import threading
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import httpx
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

app_requests_log = open("requests.log", "a", buffering=1)

from starlette.middleware.base import BaseHTTPMiddleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        app_requests_log.write(f"REQUEST: {request.method} {request.url}\n")
        response = await call_next(request)
        app_requests_log.write(f"RESPONSE: {response.status_code}\n")
        return response

from app.core.config import supabase
from app.core.redis_cache import redis_cache
from app.core.cache_decorator import cached, smart_cache
from app.core.cache_warmer import cache_warmer
from app.services.market import market_data, generate_sector_trend

# Import AI queries dynamically or normally
# These are needed for project cache warming functions
from app.routers.ai import (
    get_project_intelligence,
    get_industry_updates,
    get_project_ai_summary,
    get_project_risk_profile,
    get_synergy_ai_score,
)

app = FastAPI(title="SynergyAI API")

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Root route
@app.get("/")
def read_root():
    return {"status": "SynergyAI API is running."}

# Include routers
from app.routers import auth, projects, vdr, ai, knowledge

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(vdr.router)
app.include_router(ai.router)
app.include_router(knowledge.router)
# Old cache router removed, new cache endpoints added directly below

# --- CACHE WARMING SERVICES & SCHEDULERS ---

async def warm_market_intel_cache():
    """Pre-fetches market data to keep cache always fresh"""
    try:
        print("🔄 Warming market intelligence cache...")
        
        # Get a sample user to warm the cache
        users_result = supabase.table('users').select('id').limit(1).execute()
        
        if not users_result.data:
            print("⚠️ No users found for cache warming")
            return
            
        user_id = users_result.data[0]['id']
        
        # Create a mock request to call our own API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://localhost:8000/api/intelligence/market",
                headers={"Authorization": f"Bearer mock_token_for_background_refresh"}
            )
            
            if response.status_code == 200:
                print("✅ Market intelligence cache warmed successfully")
            else:
                print(f"❌ Cache warming API call failed: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Cache warming failed: {e}")

async def warm_market_intel_cache_direct():
    """Direct cache warming for all active users"""
    try:
        print("🔄 Warming market intelligence cache for all users...")
        
        # Get market data once
        indicators = await market_data.get_live_indices()
        top_gainers = await market_data.get_live_top_movers("gainers")
        top_losers = await market_data.get_live_top_movers("losers")
        
        # Generate sector trends
        sectors_res = supabase.table('companies').select('industry->>sector').not_.is_('industry->>sector', None).execute()
        distinct_sectors = list(set([item['sector'] for item in sectors_res.data if item.get('sector')]))[:3]

        sector_trends = []
        if distinct_sectors:
            async with httpx.AsyncClient() as client:
                tasks = [generate_sector_trend(client, sector) for sector in distinct_sectors]
                sector_trends = await asyncio.gather(*tasks)
        
        # Build the market data object
        market_data_result = {
            "indicators": indicators,
            "sectorTrends": sector_trends,
            "topGainers": top_gainers,
            "topLosers": top_losers,
            "lastUpdated": datetime.now().isoformat(),
            "dataSource": "live"
        }
        
        # Get active users and warm cache for each
        users_result = supabase.table('users').select('id').limit(10).execute()  # Limit to first 10 users
        
        if users_result.data:
            for user in users_result.data:
                user_id = user['id']
                cache_key = f"market_intel:get_market_intelligence:user_id:{user_id}"
                await redis_cache.set(cache_key, market_data_result, ttl=300)
            
            print(f"✅ Market intelligence cache warmed for {len(users_result.data)} users")
        else:
            print("⚠️ No users found for cache warming")
        
    except Exception as e:
        print(f"❌ Cache warming failed: {e}")

async def warm_ai_recommendations_cache():
    """Pre-fetches AI recommendations for active users"""
    try:
        print("🔄 Warming AI recommendations cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for AI recommendations cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            print(f"✅ AI recommendations cache warmed for user: {user_id}")
    except Exception as e:
        print(f"❌ AI recommendations cache warming failed: {e}")

async def warm_dashboard_cache():
    """Pre-fetches dashboard data for active users"""
    try:
        print("🔄 Warming dashboard cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for dashboard cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            print(f"✅ Dashboard cache warmed for user: {user_id}")
    except Exception as e:
        print(f"❌ Dashboard cache warming failed: {e}")

async def warm_chat_and_news_cache():
    """Pre-fetches chat history and news data for active users"""
    try:
        print("🔄 Warming chat and news cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for chat/news cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            print(f"✅ Chat & news cache warmed for user: {user_id}")
    except Exception as e:
        print(f"❌ Chat/news cache warming failed: {e}")

async def warm_project_intelligence_cache():
    """Pre-fetches project intelligence data for active users' projects"""
    try:
        print("🔄 Warming project intelligence cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for project intelligence cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    print(f"✅ Project intelligence cache warmed for project: {project_id}")
    except Exception as e:
        print(f"❌ Project intelligence cache warming failed: {e}")

async def warm_ai_analysis_cache():
    """Pre-fetches AI analysis data (memos, risks, annotations) for active projects"""
    try:
        print("🔄 Warming AI analysis cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for AI analysis cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    print(f"✅ AI analysis cache warmed for project: {project_id}")
    except Exception as e:
        print(f"❌ AI analysis cache warming failed: {e}")

async def warm_document_ai_cache():
    """Pre-fetches document AI data (annotations) for active projects"""
    try:
        print("🔄 Warming document AI cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for document AI cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    print(f"✅ Document AI cache warmed for project: {project_id}")
    except Exception as e:
        print(f"❌ Document AI cache warming failed: {e}")

async def warm_ai_chats_cache():
    """Pre-fetches AI chat data for active projects"""
    try:
        print("🔄 Warming AI chats cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for AI chats cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    print(f"✅ AI chats cache warmed for project: {project_id}")
    except Exception as e:
        print(f"❌ AI chats cache warming failed: {e}")

async def warm_mission_control_cache():
    """Pre-fetches mission control data for active projects"""
    try:
        print("🔄 Warming mission control cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for mission control cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    print(f"✅ Mission control cache warmed for project: {project_id}")
    except Exception as e:
        print(f"❌ Mission control cache warming failed: {e}")

async def warm_comprehensive_cache():
    """Pre-fetches all critical data to keep cache always fresh"""
    try:
        print("🔄 Warming comprehensive application cache...")
        users_result = supabase.table('users').select('id').limit(5).execute()
        if not users_result.data:
            print("⚠️ No users found for cache warming")
            return
            
        for user in users_result.data:
            user_id = user['id']
            try:
                # Warm projects cache
                projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
                if projects_res.data:
                    cache_key = f"projects:get_projects:user_id:{user_id}"
                    await redis_cache.set(cache_key, projects_res.data, ttl=300)
                
                # Warm watchlists counts
                watchlists_res = supabase.rpc('get_user_watchlists_with_counts', {'p_user_id': user_id}).execute()
                if watchlists_res.data:
                    cache_key = f"watchlists_counts:get_watchlists_with_counts:user_id:{user_id}"
                    await redis_cache.set(cache_key, watchlists_res.data, ttl=300)
                
                # Warm chat history
                chat_res = supabase.table('chat_conversations').select(
                    'id, title, messages, created_at, updated_at'
                ).eq('user_id', user_id).order('created_at', desc=True).execute()
                if chat_res.data:
                    cache_key = f"chat_history:get_chat_history:user_id:{user_id}"
                    await redis_cache.set(cache_key, chat_res.data, ttl=300)
                
                # Warm user profile
                user_res = supabase.table('users').select('id, name, email, avatar_url:image').eq('id', user_id).single().execute()
                if user_res.data:
                    cache_key = f"user_profile:get_current_user_profile:user_id:{user_id}"
                    await redis_cache.set(cache_key, user_res.data, ttl=300)
                
                print(f"✅ User caches warmed for: {user_id}")
            except Exception as user_error:
                print(f"❌ Error warming user caches for {user_id}: {user_error}")
                continue
            
            # WARM PROJECT-SPECIFIC CACHES
            projects_res = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects_res.data:
                for project in projects_res.data:
                    project_id = project['id']
                    try:
                        # Warm project team
                        team_res = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
                        if team_res.data:
                            cache_key = f"project_team:get_project_team:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, team_res.data, ttl=300)
                        
                        # Warm VDR documents
                        docs_res = supabase.table('vdr_documents').select('*').eq('project_id', project_id).order('uploaded_at', desc=True).limit(10).execute()
                        if docs_res.data:
                            cache_key = f"vdr_documents:get_vdr_documents:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, docs_res.data, ttl=300)
                        
                        # Warm VDR categories
                        cats_res = supabase.rpc('get_categories_with_counts', {'project_id_param': project_id}).execute()
                        if cats_res.data:
                            cache_key = f"vdr_categories:get_categories:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, cats_res.data, ttl=600)
                        
                        # Warm knowledge graph and alerts
                        kg_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
                        if kg_res.data:
                            alerts_res = supabase.table('events').select('*').eq('company_cin', kg_res.data['company_cin']).order('event_date', desc=True).limit(50).execute()
                            if alerts_res.data:
                                cache_key = f"project_alerts:get_project_alerts:project_id:{project_id}:user_id:{user_id}"
                                await redis_cache.set(cache_key, alerts_res.data, ttl=180)
                        
                        # Warm AI chats
                        chats_res = supabase.table('project_ai_chats').select('id, title, messages, updated_at, created_at').eq('project_id', project_id).eq('user_id', user_id).order('updated_at', desc=True).execute()
                        if chats_res.data:
                            cache_key = f"project_ai_chats:get_project_ai_chats:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, chats_res.data, ttl=300)
                        
                        # Warm project user profile
                        user_profile_res = supabase.table('users').select('name, email').eq('id', user_id).execute()
                        if user_profile_res.data:
                            profile_data = user_profile_res.data[0]
                            role_result = supabase.rpc('get_user_project_role', {
                                'p_user_id': user_id,
                                'p_project_id': project_id
                            }).execute()
                            project_role = role_result.data[0].get('role', 'Member') if role_result.data else "Member"
                            
                            user_profile_data = {
                                "id": user_id,
                                "name": profile_data.get('name', 'User'),
                                "email": profile_data.get('email', 'user@email.com'),
                                "project_role": project_role,
                                "avatar_url": None
                            }
                            cache_key = f"project_user_profile:get_project_user_profile:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, user_profile_data, ttl=300)

                        # Warm project tasks
                        tasks_res = supabase.rpc('get_project_tasks_with_assignee', {'p_project_id': project_id}).execute()
                        if tasks_res.data:
                            cache_key = f"project_tasks:get_project_tasks:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, tasks_res.data, ttl=300)
                        
                        # Warm access summary
                        access_res = supabase.table('project_members').select('role', count='exact').eq('project_id', project_id).execute()
                        if access_res.data:
                            total_members = access_res.count if access_res.count is not None else 0
                            admin_count = sum(1 for member in access_res.data if member['role'] == 'Admin')
                            access_data = {"totalMembers": total_members, "adminCount": admin_count}
                            cache_key = f"access_summary:get_project_access_summary:project_id:{project_id}:user_id:{user_id}"
                            await redis_cache.set(cache_key, access_data, ttl=300)
                        
                        print(f"✅ Project caches warmed for project: {project_id}")
                    except Exception as project_error:
                        print(f"❌ Error warming caches for project {project_id}: {project_error}")
                        continue
            
            print(f"✅ Comprehensive cache warmed for user: {user_id}")
        print("🎉 Comprehensive cache warming completed successfully!")
    except Exception as e:
        print(f"❌ Comprehensive cache warming failed: {e}")

async def safe_cache_warming(func, *args, **kwargs):
    """Wrapper to handle server disconnections during cache warming"""
    try:
        await func(*args, **kwargs)
    except Exception as e:
        print(f"⚠️ Cache warming failed but continuing: {e}")

async def warm_with_retry(warm_func, max_retries=2):
    """Retry failed cache warming operations"""
    for attempt in range(max_retries):
        try:
            await warm_func()
            break
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"❌ Failed after {max_retries} attempts: {e}")

async def warm_all_project_caches(project_id: str, user_id: str):
    """
    Pre-warms ALL project-related caches when mission control is accessed.
    This ensures instant responses for all subsequent project requests.
    """
    print(f"🔥 Pre-warming all caches for project: {project_id}")
    try:
        warming_tasks = [
            warm_project_team_cache(project_id, user_id),
            warm_vdr_documents_cache(project_id, user_id),
            warm_vdr_categories_cache(project_id, user_id),
            warm_project_alerts_cache(project_id, user_id),
            
            warm_project_intelligence_cache_single(project_id, user_id),
            warm_industry_insights_cache(project_id, user_id),
            warm_ai_summary_cache(project_id, user_id),
            
            warm_risk_profile_cache(project_id, user_id),
            warm_synergy_score_cache(project_id, user_id),
            
            warm_project_tasks_cache(project_id, user_id),
            warm_access_summary_cache(project_id, user_id),
            warm_project_ai_chats_cache(project_id, user_id),
            
            warm_annotated_documents_cache(project_id, user_id),
            
            warm_simulations_cache(project_id, user_id),
            warm_scenarios_cache(project_id, user_id),
        ]
        await asyncio.gather(*warming_tasks, return_exceptions=True)
        print(f"✅ All project caches warmed for: {project_id}")
    except Exception as e:
        print(f"⚠️ Error during project cache warming: {e}")

# Individual cache warming functions
async def warm_project_team_cache(project_id: str, user_id: str):
    try:
        result = supabase.rpc('get_project_team_members', {'p_project_id': project_id}).execute()
        cache_key = f"project_team:get_project_team:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data if result.data else [], ttl=300)
    except Exception as e:
        print(f"⚠️ Team cache warming failed: {e}")

async def warm_vdr_documents_cache(project_id: str, user_id: str):
    try:
        result = supabase.table('vdr_documents').select('*').eq('project_id', project_id).order('uploaded_at', desc=True).limit(10).execute()
        cache_key = f"vdr_documents:get_vdr_documents:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data, ttl=300)
    except Exception as e:
        print(f"⚠️ VDR documents cache warming failed: {e}")

async def warm_vdr_categories_cache(project_id: str, user_id: str):
    try:
        result = supabase.rpc('get_categories_with_counts', {'project_id_param': project_id}).execute()
        cache_key = f"vdr_categories:get_categories:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data, ttl=600)
    except Exception as e:
        print(f"⚠️ VDR categories cache warming failed: {e}")

async def warm_project_alerts_cache(project_id: str, user_id: str):
    try:
        project_res = supabase.table('projects').select('company_cin').eq('id', project_id).single().execute()
        if project_res.data:
            result = supabase.table('events').select('*').eq('company_cin', project_res.data['company_cin']).order('event_date', desc=True).limit(50).execute()
            cache_key = f"project_alerts:get_project_alerts:project_id:{project_id}:user_id:{user_id}"
            await redis_cache.set(cache_key, result.data, ttl=180)
    except Exception as e:
        print(f"⚠️ Alerts cache warming failed: {e}")

async def warm_project_intelligence_cache_single(project_id: str, user_id: str):
    try:
        cache_key = f"project_intelligence:get_project_intelligence:project_id:{project_id}:user_id:{user_id}"
        data = await get_project_intelligence(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=300)
    except Exception as e:
        print(f"⚠️ Intelligence cache warming failed: {e}")

async def warm_industry_insights_cache(project_id: str, user_id: str):
    try:
        cache_key = f"industry_insights:get_industry_updates:project_id:{project_id}:user_id:{user_id}"
        data = await get_industry_updates(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=600)
    except Exception as e:
        print(f"⚠️ Industry insights cache warming failed: {e}")

async def warm_ai_summary_cache(project_id: str, user_id: str):
    try:
        cache_key = f"project_ai_summary:get_project_ai_summary:project_id:{project_id}:user_id:{user_id}"
        data = await get_project_ai_summary(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=600)
    except Exception as e:
        print(f"⚠️ AI summary cache warming failed: {e}")

async def warm_risk_profile_cache(project_id: str, user_id: str):
    try:
        cache_key = f"risk_profile:get_project_risk_profile:user_id:{user_id}:project_id:{project_id}"
        cached = await redis_cache.get(cache_key)
        if cached:
            print(f"  ⚡ Risk profile already cached")
            return
            
        print(f"  🔄 Warming risk profile...")
        data = await get_project_risk_profile(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=600)
        print(f"  ✅ Risk profile cached")
    except Exception as e:
        print(f"⚠️ Risk profile cache warming failed: {e}")

async def warm_synergy_score_cache(project_id: str, user_id: str):
    try:
        cache_key = f"synergy_score:get_synergy_ai_score:user_id:{user_id}:project_id:{project_id}"
        cached = await redis_cache.get(cache_key)
        if cached:
            print(f"  ⚡ Synergy score already cached")
            return
            
        print(f"  🔄 Warming synergy score...")
        data = await get_synergy_ai_score(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=600)
        print(f"  ✅ Synergy score cached")
    except Exception as e:
        print(f"⚠️ Synergy score cache warming failed: {e}")

async def warm_project_ai_summary_cache(project_id: str, user_id: str):
    try:
        cache_key = f"project_ai_summary:get_project_ai_summary:user_id:{user_id}:project_id:{project_id}"
        cached = await redis_cache.get(cache_key)
        if cached:
            print(f"  ⚡ AI summary already cached")
            return
            
        print(f"  🔄 Warming AI summary...")
        data = await get_project_ai_summary(project_id, user_id)
        await redis_cache.set(cache_key, data, ttl=600)
        print(f"  ✅ AI summary cached")
    except Exception as e:
        print(f"⚠️ AI summary cache warming failed: {e}")

async def warm_project_tasks_cache(project_id: str, user_id: str):
    try:
        result = supabase.rpc('get_project_tasks_with_assignee', {'p_project_id': project_id}).execute()
        cache_key = f"project_tasks:get_project_tasks:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data if result.data else [], ttl=300)
    except Exception as e:
        print(f"⚠️ Tasks cache warming failed: {e}")

async def warm_access_summary_cache(project_id: str, user_id: str):
    try:
        result = supabase.table('project_members').select('role', count='exact').eq('project_id', project_id).execute()
        total_members = result.count if result.count is not None else 0
        admin_count = sum(1 for member in result.data if member['role'] == 'Admin') if result.data else 0
        access_data = {"totalMembers": total_members, "adminCount": admin_count}
        cache_key = f"access_summary:get_project_access_summary:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, access_data, ttl=300)
    except Exception as e:
        print(f"⚠️ Access summary cache warming failed: {e}")

async def warm_project_ai_chats_cache(project_id: str, user_id: str):
    try:
        result = supabase.table('project_ai_chats').select('id, title, messages, updated_at, created_at').eq('project_id', project_id).eq('user_id', user_id).order('updated_at', desc=True).execute()
        cache_key = f"project_ai_chats:get_project_ai_chats:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data, ttl=300)
    except Exception as e:
        print(f"⚠️ AI chats cache warming failed: {e}")

async def warm_annotated_documents_cache(project_id: str, user_id: str):
    try:
        docs_result = supabase.table('vdr_documents').select('id, file_name, uploaded_at, category').eq('project_id', project_id).order('uploaded_at', desc=True).execute()
        if docs_result.data:
            documents_with_counts = []
            for doc in docs_result.data:
                annotations_result = supabase.table('document_annotations').select('*', count='exact').eq('document_id', doc['id']).execute()
                total_annotations = annotations_result.count or 0
                unresolved_result = supabase.table('document_annotations').select('*', count='exact').eq('document_id', doc['id']).eq('resolved', False).execute()
                unresolved_count = unresolved_result.count or 0
                documents_with_counts.append({
                    "id": doc["id"],
                    "name": doc["file_name"],
                    "comment_count": total_annotations,
                    "unresolved_count": unresolved_count,
                    "uploaded_at": doc.get("uploaded_at"),
                    "category": doc.get("category", "Uncategorized")
                })
            cache_key = f"annotated_documents:project_id:{project_id}:user_id:{user_id}"
            await redis_cache.set(cache_key, documents_with_counts, ttl=300)
    except Exception as e:
        print(f"⚠️ Annotated documents cache warming failed: {e}")

async def warm_simulations_cache(project_id: str, user_id: str):
    try:
        result = supabase.table('valuation_simulations').select('id, name, variables, results_summary').eq('project_id', project_id).eq('user_id', user_id).order('created_at').execute()
        cache_key = f"simulations:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data, ttl=600)
    except Exception as e:
        print(f"⚠️ Simulations cache warming failed: {e}")

async def warm_scenarios_cache(project_id: str, user_id: str):
    try:
        result = supabase.table('valuation_scenarios').select('*').eq('project_id', project_id).eq('user_id', user_id).order('created_at', desc=True).execute()
        cache_key = f"scenarios:project_id:{project_id}:user_id:{user_id}"
        await redis_cache.set(cache_key, result.data, ttl=600)
    except Exception as e:
        print(f"⚠️ Scenarios cache warming failed: {e}")

async def warm_active_projects_caches():
    """Intelligently warms caches for recently active projects."""
    try:
        print("🔥 Warming caches for active projects...")
        recent_projects = supabase.table('projects').select(
            'id, created_by_user_id'
        ).order('updated_at', desc=True).limit(5).execute()
        
        if recent_projects.data:
            warming_tasks = []
            for project in recent_projects.data:
                task = warm_all_project_caches(
                    project['id'], 
                    project['created_by_user_id']
                )
                warming_tasks.append(task)
            await asyncio.gather(*warming_tasks, return_exceptions=True)
            print(f"✅ Warmed caches for {len(recent_projects.data)} active projects")
    except Exception as e:
        print(f"❌ Active projects cache warming failed: {e}")

async def warm_critical_project_caches(project_id: str, user_id: str):
    print(f"⚡ Pre-warming CRITICAL caches for project: {project_id}")
    try:
        critical_tasks = [
            warm_risk_profile_cache(project_id, user_id),
            warm_synergy_score_cache(project_id, user_id),
            warm_project_ai_summary_cache(project_id, user_id),
        ]
        await asyncio.wait_for(
            asyncio.gather(*critical_tasks, return_exceptions=True),
            timeout=5.0
        )
        print(f"✅ Critical caches warmed for: {project_id}")
    except asyncio.TimeoutError:
        print(f"⚠️ Critical cache warming timed out for: {project_id}")
    except Exception as e:
        print(f"⚠️ Error during critical cache warming: {e}")

async def warm_non_critical_project_caches(project_id: str, user_id: str):
    print(f"🔥 Pre-warming NON-CRITICAL caches for project: {project_id}")
    try:
        non_critical_tasks = [
            warm_project_team_cache(project_id, user_id),
            warm_vdr_documents_cache(project_id, user_id),
            warm_vdr_categories_cache(project_id, user_id),
            warm_project_alerts_cache(project_id, user_id),
            warm_project_intelligence_cache_single(project_id, user_id),
            warm_industry_insights_cache(project_id, user_id),
            warm_project_tasks_cache(project_id, user_id),
            warm_access_summary_cache(project_id, user_id),
            warm_project_ai_chats_cache(project_id, user_id),
            warm_annotated_documents_cache(project_id, user_id),
            warm_simulations_cache(project_id, user_id),
            warm_scenarios_cache(project_id, user_id),
        ]
        await asyncio.gather(*non_critical_tasks, return_exceptions=True)
        print(f"✅ Non-critical caches warmed for: {project_id}")
    except Exception as e:
        print(f"⚠️ Error during non-critical cache warming: {e}")

# Scheduler runner
def start_background_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        lambda: asyncio.run(warm_market_intel_cache_direct()),
        'interval',
        minutes=3,
        id='market_intel_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_active_projects_caches()),
        'interval',
        minutes=2,
        id='active_projects_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_ai_recommendations_cache()),
        'interval', 
        minutes=10,
        id='ai_recommendations_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_dashboard_cache()),
        'interval',
        minutes=5,
        id='dashboard_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_chat_and_news_cache()),
        'interval',
        minutes=5,
        id='chat_news_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_project_intelligence_cache()),
        'interval',
        minutes=10,
        id='project_intelligence_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_ai_analysis_cache()),
        'interval',
        minutes=15,
        id='ai_analysis_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_document_ai_cache()),
        'interval',
        minutes=10,
        id='document_ai_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_ai_chats_cache()),
        'interval',
        minutes=5,
        id='ai_chats_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_mission_control_cache()),
        'interval',
        minutes=5,
        id='mission_control_cache_warmer'
    )
    scheduler.add_job(
        lambda: asyncio.run(warm_comprehensive_cache()),
        'interval',
        minutes=5,
        id='comprehensive_cache_warmer'
    )
    scheduler.start()
    print("🚀 Background cache warmer started (3-minute intervals)")

@app.on_event("startup")
async def startup_event():
    """Initialize all services"""
    # Start cache warmer
    cache_warmer.start()
    
    # Warm critical caches immediately
    asyncio.create_task(cache_warmer.warm_all_active_users())
    
    print("✅ All cache services initialized")

@app.post("/api/cache/warm/{user_id}")
async def warm_user_cache_manually(user_id: str, admin_key: str):
    """Manually warm cache for a user (admin only)"""
    if admin_key != os.getenv('ADMIN_KEY', 'synergy_admin_secure_key_123'):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    await cache_warmer.warm_user_cache(user_id)
    return {"message": f"Cache warming initiated for user: {user_id}"}

@app.get("/api/cache/stats")
async def cache_stats():
    """Get cache performance metrics"""
    return {
        "hits": smart_cache.hit_count,
        "misses": smart_cache.miss_count,
        "hit_rate": f"{smart_cache.hit_count / max(1, (smart_cache.hit_count + smart_cache.miss_count)) * 100:.1f}%",
        "redis_connected": bool(redis_cache.redis_client)
    }

@app.post("/api/cache/clear")
async def clear_all_cache():
    """Emergency cache clear"""
    await redis_cache.delete_pattern("*")
    smart_cache.memory_cache.clear()
    return {"message": "All cache cleared"}
