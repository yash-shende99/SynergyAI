import redis.asyncio as redis
import json
import fnmatch
import time
import os
from typing import Optional, Any
import asyncio
from dotenv import load_dotenv

load_dotenv()

class RedisCache:
    """Enterprise-grade Multi-Tier Cache (L1 Memory TTL + L2 Redis) with automatic fallback"""
    
    def __init__(self):
        self.redis_client = None
        self.is_redis_connected = False
        self._last_redis_check = 0.0
        self._check_interval = 30.0  # seconds between redis reconnection attempts
        self.memory_store = {}  # {key: {"data": Any, "expires_at": float}}
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis client handle"""
        try:
            url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            if '.upstash.io' in url and url.startswith('redis://'):
                url = url.replace('redis://', 'rediss://', 1)
            self.redis_client = redis.from_url(
                url,
                decode_responses=True,
                socket_keepalive=True,
                retry_on_timeout=True,
                health_check_interval=30
            )
        except Exception as e:
            print(f"⚠️ Redis init error: {e}")
            self.redis_client = None

    async def ping(self) -> bool:
        """Check if Redis server is genuinely responding"""
        if not self.redis_client:
            self.is_redis_connected = False
            return False
        try:
            res = await asyncio.wait_for(self.redis_client.ping(), timeout=1.0)
            self.is_redis_connected = bool(res)
            return self.is_redis_connected
        except Exception:
            self.is_redis_connected = False
            return False

    async def _ensure_redis_status(self):
        """Throttled check to avoid hammering a dead port with connect attempts"""
        now = time.time()
        if now - self._last_redis_check > self._check_interval:
            self._last_redis_check = now
            await self.ping()

    def _get_memory(self, key: str) -> Optional[Any]:
        """Retrieve from L1 in-memory TTL store"""
        entry = self.memory_store.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            self.memory_store.pop(key, None)
            return None
        return entry["data"]

    def _set_memory(self, key: str, value: Any, ttl: int):
        """Set in L1 in-memory TTL store with automatic pruning"""
        # Periodic cleanup if store grows large
        if len(self.memory_store) > 1000:
            now = time.time()
            expired_keys = [k for k, v in self.memory_store.items() if now > v["expires_at"]]
            for k in expired_keys:
                self.memory_store.pop(k, None)
        
        self.memory_store[key] = {
            "data": value,
            "expires_at": time.time() + max(1, ttl)
        }

    async def get(self, key: str) -> Optional[Any]:
        """Get cached data (checks L1 memory first, then L2 Redis)"""
        # 1. Check L1 In-Memory Cache
        mem_data = self._get_memory(key)
        if mem_data is not None:
            return mem_data

        # 2. Check L2 Redis if available
        await self._ensure_redis_status()
        if self.is_redis_connected and self.redis_client:
            try:
                data = await self.redis_client.get(key)
                if data:
                    deserialized = json.loads(data)
                    # Backfill L1 memory store for faster subsequent hits
                    self._set_memory(key, deserialized, ttl=300)
                    return deserialized
            except Exception:
                self.is_redis_connected = False
        
        return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        """Set cached data with TTL in seconds (writes to both L1 memory and L2 Redis)"""
        # 1. Always write to L1 in-memory store
        self._set_memory(key, value, ttl)

        # 2. Write to L2 Redis if available
        await self._ensure_redis_status()
        if self.is_redis_connected and self.redis_client:
            try:
                await self.redis_client.setex(
                    key, 
                    ttl, 
                    json.dumps(value, default=str)
                )
            except Exception:
                self.is_redis_connected = False

    async def delete(self, key: str):
        """Delete specific key from both caches"""
        self.memory_store.pop(key, None)
        if self.is_redis_connected and self.redis_client:
            try:
                await self.redis_client.delete(key)
            except Exception:
                self.is_redis_connected = False

    async def delete_pattern(self, pattern: str):
        """Delete all keys matching pattern (e.g. 'market:*') from both caches"""
        # Prune from memory
        keys_to_del = [k for k in list(self.memory_store.keys()) if fnmatch.fnmatch(k, pattern)]
        for k in keys_to_del:
            self.memory_store.pop(k, None)

        # Prune from Redis
        if self.is_redis_connected and self.redis_client:
            try:
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
            except Exception:
                self.is_redis_connected = False

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

