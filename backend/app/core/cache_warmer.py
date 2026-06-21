import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import httpx
from datetime import datetime, timedelta
from typing import List
from app.core.config import supabase

class CacheWarmer:
    """
    Intelligent cache pre-warming for frequently accessed data
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.active_users = set()
        self._lock = asyncio.Lock()
    
    async def get_active_users(self) -> List[str]:
        """Get recently active users"""
        try:
            # Get users who logged in within last 2 hours
            cutoff = (datetime.utcnow() - timedelta(hours=2)).isoformat()
            result = supabase.table('users')\
                .select('id')\
                .gte('last_login', cutoff)\
                .limit(20)\
                .execute()
            return [u['id'] for u in result.data]
        except Exception as e:
            print(f"Error getting active users: {e}")
            return []
    
    async def warm_user_cache(self, user_id: str):
        """Pre-warm all caches for a user"""
        print(f"🔥 Warming cache for user: {user_id}")
        
        try:
            # Warm critical endpoints
            warm_tasks = [
                self._warm_endpoint(f"/api/intelligence/market?user_id={user_id}"),
                self._warm_endpoint(f"/api/dashboard/narrative?user_id={user_id}"),
                self._warm_endpoint(f"/api/dashboard/chart_data?user_id={user_id}"),
                self._warm_endpoint(f"/api/ai/recommendations?user_id={user_id}"),
            ]
            
            # Get user's projects
            projects = supabase.rpc('get_user_projects', {'p_user_id': user_id}).execute()
            if projects.data:
                for project in projects.data[:5]:
                    warm_tasks.append(
                        self._warm_endpoint(
                            f"/api/projects/{project['id']}/mission_control?user_id={user_id}"
                        )
                    )
                    warm_tasks.append(
                        self._warm_endpoint(
                            f"/api/projects/{project['id']}/synergy_score?user_id={user_id}"
                        )
                    )
            
            await asyncio.gather(*warm_tasks, return_exceptions=True)
            print(f"✅ Cache warmed for user: {user_id}")
            
        except Exception as e:
            print(f"❌ Cache warming failed for {user_id}: {e}")
    
    async def _warm_endpoint(self, url: str):
        """Internal warming call"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"http://localhost:8000{url}")
                if response.status_code == 200:
                    print(f"  ✅ Warmed: {url}")
                else:
                    print(f"  ⚠️ Failed: {url} ({response.status_code})")
        except Exception as e:
            print(f"  ❌ Error warming {url}: {e}")
    
    async def warm_all_active_users(self):
        """Background job to warm all active users"""
        print("🔄 Starting cache warming for active users...")
        users = await self.get_active_users()
        
        if not users:
            print("⚠️ No active users found")
            return
        
        # Warm users in batches
        batch_size = 3
        for i in range(0, len(users), batch_size):
            batch = users[i:i+batch_size]
            await asyncio.gather(*[self.warm_user_cache(u) for u in batch])
            await asyncio.sleep(1)  # Rate limiting
    
    def start(self):
        """Start the cache warmer scheduler"""
        # Warm every 5 minutes
        self.scheduler.add_job(
            self.warm_all_active_users,
            trigger=IntervalTrigger(minutes=5),
            id='cache_warmer'
        )
        self.scheduler.start()
        print("🚀 Cache warmer started")
    
    async def warm_on_user_login(self, user_id: str):
        """Warm cache immediately when user logs in"""
        asyncio.create_task(self.warm_user_cache(user_id))

# Initialize global warmer
cache_warmer = CacheWarmer()
