import time
import asyncio
from functools import wraps
from typing import Dict, Any

class EnhancedMemoryCache:
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0
    
    async def get(self, key: str) -> Any:
        async with self._lock:
            if key in self._cache:
                data, expiry = self._cache[key]
                if expiry is None or time.time() < expiry:
                    self._hits += 1
                    return data
                else:
                    del self._cache[key]
            self._misses += 1
            return None
    
    async def set(self, key: str, value: Any, ex: int = None):
        async with self._lock:
            expiry = time.time() + ex if ex else None
            self._cache[key] = (value, expiry)
    
    async def delete(self, key: str):
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
    
    async def delete_pattern(self, pattern: str):
        """Delete all keys matching pattern"""
        async with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if pattern in k]
            for key in keys_to_delete:
                del self._cache[key]
    
    async def get_stats(self):
        async with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0
            return {
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": f"{hit_rate:.1f}%",
                "total_keys": len(self._cache)
            }

# Initialize global cache
enhanced_cache = EnhancedMemoryCache()

def cache_response(ttl: int = 300, key_prefix: str = "", global_cache: bool = False):
    """Decorator to cache responses using the global EnhancedMemoryCache."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                # Build cache key
                if global_cache:
                    # Use global key for shared data like market intelligence
                    cache_key = f"{key_prefix}:{func.__name__}:global"
                else:
                    # User-specific key with project_id when available
                    cache_key_parts = [key_prefix, func.__name__]
                    
                    # Always include user_id and project_id if available
                    user_id = kwargs.get('user_id')
                    project_id = kwargs.get('project_id')
                    
                    if user_id:
                        cache_key_parts.append(f"user_id:{user_id}")
                    if project_id:
                        cache_key_parts.append(f"project_id:{project_id}")
                    
                    # Include other relevant kwargs
                    for arg_name, arg_value in kwargs.items():
                        if arg_name in ['query', 'sector', 'hq_state', 'document_id', 'chat_id']:
                            cache_key_parts.append(f"{arg_name}:{arg_value}")
                    
                    cache_key = ":".join(str(part) for part in cache_key_parts if part)
                
                # Try to get from cache
                cached = await enhanced_cache.get(cache_key)
                if cached is not None:
                    print(f"✅ Cache HIT for {cache_key}")
                    return cached
                
                # If not in cache, execute function
                print(f"❌ Cache MISS for {cache_key}")
                result = await func(*args, **kwargs)
                
                # Store in cache
                if result is not None:
                    await enhanced_cache.set(cache_key, result, ex=ttl)
                
                return result
                
            except Exception as e:
                print(f"Cache error in {func.__name__}: {e}")
                return await func(*args, **kwargs)
        return wrapper
    return decorator
