from functools import wraps
import hashlib
import json
import time
from typing import Optional, Dict, Any
import asyncio
from datetime import datetime
from app.core.redis_cache import redis_cache

class SmartCache:
    """Intelligent caching with automatic TTL adjustment and hybrid store"""
    
    def __init__(self):
        self.redis = redis_cache
        self.hit_count = 0
        self.miss_count = 0
        self._lock = asyncio.Lock()

    @property
    def memory_cache(self):
        """Underlying in-memory store reference"""
        return self.redis.memory_store
    
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
        
        # Add request parameters (excluding non-cacheable internal objects)
        excluded = {'user_id', 'project_id', 'request', 'response', 'db', 'background_tasks', 'current_user'}
        for arg_name, arg_value in sorted(kwargs.items()):
            if arg_name not in excluded and arg_value is not None:
                # Avoid non-serializable objects
                val_str = str(arg_value)
                if "<" not in val_str and "object at 0x" not in val_str:
                    key_parts.append(f"{arg_name}:{val_str}")
        
        for arg in args:
            if arg is not None:
                val_str = str(arg)
                if "<" not in val_str and "object at 0x" not in val_str:
                    key_parts.append(val_str)
        
        # Hash long keys to keep cache keys manageable
        raw_key = ":".join(str(p) for p in key_parts)
        if len(raw_key) > 200:
            hash_obj = hashlib.sha256(raw_key.encode())
            raw_key = f"{prefix}:{hash_obj.hexdigest()[:16]}"
        
        return raw_key

smart_cache = SmartCache()

def cached(ttl: Optional[int] = None, request_type: str = "ai_heavy", cache_null=False):
    """
    Enterprise-grade cache decorator with automatic TTL and hybrid L1/L2 backing
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = smart_cache.generate_key(
                f"{func.__module__}:{func.__name__}",
                *args,
                **kwargs
            )
            
            # Check cache (hits L1 in-memory TTL first, then L2 Redis)
            cached_result = await smart_cache.redis.get(cache_key)
            if cached_result is not None:
                smart_cache.hit_count += 1
                print(f"✅ Cache HIT: {cache_key}")
                return cached_result
            
            smart_cache.miss_count += 1
            print(f"❌ Cache MISS: {cache_key}")
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Do not cache error fallbacks or failed analyses
            is_error_response = False
            if isinstance(result, dict):
                rationale = str(result.get('rationale', ''))
                if 'Unable to generate' in rationale or 'service error' in str(result):
                    is_error_response = True

            # Cache result if not None and not an error response
            if (result is not None and not is_error_response) or cache_null:
                actual_ttl = ttl or smart_cache.calculate_ttl(
                    request_type,
                    complexity="heavy" if "ai" in request_type else "medium"
                )
                await smart_cache.redis.set(cache_key, result, actual_ttl)
            
            return result
        return wrapper
    return decorator
