from functools import wraps
import hashlib
import json
import time
from typing import Optional, Dict, Any
import asyncio
from datetime import datetime
from app.core.redis_cache import redis_cache

class SmartCache:
    """Intelligent caching with automatic TTL adjustment"""
    
    def __init__(self):
        self.redis = redis_cache
        self.memory_cache = {}
        self.hit_count = 0
        self.miss_count = 0
        self._lock = asyncio.Lock()
    
    def calculate_ttl(self, request_type: str, complexity: str = "medium") -> int:
        """Smart TTL calculation based on data type"""
        ttl_map = {
            "static": 3600,      # 1 hour - never changes
            "market": 180,       # 3 minutes - fast-changing
            "user": 600,         # 10 minutes - user-specific
            "ai_heavy": 1800,    # 30 minutes - expensive AI calls
            "ai_light": 900,     # 15 minutes - lightweight AI
            "project": 600,      # 10 minutes - project data
            "documents": 300,    # 5 minutes - VDR documents
        }
        
        # Adjust based on time of day (peak hours = shorter TTL)
        hour = datetime.now().hour
        if 9 <= hour <= 17:  # Business hours
            ttl_map = {k: v * 0.5 for k, v in ttl_map.items()}
        
        return int(ttl_map.get(request_type, 300))
    
    def generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate deterministic cache key"""
        key_parts = [prefix]
        
        # Add user context if present
        if 'user_id' in kwargs:
            key_parts.append(f"user:{kwargs['user_id']}")
        if 'project_id' in kwargs:
            key_parts.append(f"project:{kwargs['project_id']}")
        
        # Add request parameters
        for arg_name, arg_value in kwargs.items():
            if arg_name not in ['user_id', 'project_id']:
                key_parts.append(f"{arg_name}:{arg_value}")
        
        # Hash long keys to keep Redis keys manageable
        raw_key = ":".join(str(p) for p in key_parts)
        if len(raw_key) > 200:
            hash_obj = hashlib.sha256(raw_key.encode())
            raw_key = f"{prefix}:{hash_obj.hexdigest()[:16]}"
        
        return raw_key

smart_cache = SmartCache()

def cached(ttl: Optional[int] = None, request_type: str = "ai_heavy", cache_null=False):
    """
    Enterprise-grade cache decorator with automatic TTL
    
    Usage:
        @cached(request_type="ai_heavy")
        async def expensive_function(user_id, project_id):
            ...
    
        @cached(ttl=60, request_type="market")  # Force 60 second TTL
        async def market_data():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user_id and project_id from kwargs
            user_id = kwargs.get('user_id')
            project_id = kwargs.get('project_id')
            
            # Generate cache key
            cache_key = smart_cache.generate_key(
                f"{func.__module__}:{func.__name__}",
                **kwargs
            )
            
            # Check cache
            cached_result = await smart_cache.redis.get(cache_key)
            if cached_result is not None:
                smart_cache.hit_count += 1
                print(f"✅ Cache HIT: {cache_key}")
                return cached_result
            
            smart_cache.miss_count += 1
            print(f"❌ Cache MISS: {cache_key}")
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result if not None
            if result is not None or cache_null:
                actual_ttl = ttl or smart_cache.calculate_ttl(
                    request_type,
                    complexity="heavy" if "ai" in request_type else "medium"
                )
                await smart_cache.redis.set(cache_key, result, actual_ttl)
            
            return result
        return wrapper
    return decorator
