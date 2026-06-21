import redis.asyncio as redis
import json
import hashlib
import os
from typing import Optional, Any
from datetime import timedelta
import asyncio

class RedisCache:
    """Enterprise-grade Redis cache with automatic fallback"""
    
    def __init__(self):
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis with retry logic"""
        try:
            self.redis_client = redis.from_url(
                os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
                decode_responses=True,
                socket_keepalive=True,
                retry_on_timeout=True,
                health_check_interval=30
            )
            print("✅ Redis connected successfully")
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            self.redis_client = None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cached data with JSON deserialization"""
        if not self.redis_client:
            return None
        try:
            data = await self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        """Set cached data with TTL in seconds"""
        if not self.redis_client:
            return
        try:
            await self.redis_client.setex(
                key, 
                ttl, 
                json.dumps(value, default=str)
            )
        except Exception as e:
            print(f"Redis set error: {e}")
    
    async def delete(self, key: str):
        """Delete specific key"""
        if self.redis_client:
            await self.redis_client.delete(key)
    
    async def delete_pattern(self, pattern: str):
        """Delete all keys matching pattern"""
        if not self.redis_client:
            return
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
        except Exception as e:
            print(f"Redis delete pattern error: {e}")
    
    async def get_or_set(self, key: str, func, ttl: int = 300, *args, **kwargs):
        """Get from cache or execute function and cache result"""
        cached = await self.get(key)
        if cached is not None:
            return cached
        
        result = await func(*args, **kwargs)
        if result is not None:
            await self.set(key, result, ttl)
        return result

# Singleton instance
redis_cache = RedisCache()
