from fastapi.responses import StreamingResponse
import asyncio
import json
from app.core.redis_cache import redis_cache

class StreamingCacheResponse:
    """
    Stream AI responses while checking cache in background
    """
    
    async def stream_with_cache(self, cache_key: str, ai_func, *args, **kwargs):
        """
        Stream response while checking cache and fallback
        """
        # Check cache first
        cached = await redis_cache.get(cache_key)
        if cached:
            yield json.dumps({"type": "cached", "data": cached}) + "\n"
            yield json.dumps({"type": "complete"}) + "\n"
            return
        
        # Stream AI response
        complete_response = ""
        async for chunk in self._stream_ai(ai_func, *args, **kwargs):
            # Try to extract actual token to cache later if needed
            try:
                data = json.loads(chunk.strip())
                if data["type"] == "token":
                    complete_response += data["data"]
            except Exception:
                pass
            yield chunk
            
        # Cache the complete response if we got one
        if complete_response:
            await redis_cache.set(cache_key, complete_response, ttl=1800)
    
    async def _stream_ai(self, ai_func, *args, **kwargs):
        """Stream AI response token by token"""
        try:
            async for token in ai_func(*args, **kwargs):
                yield json.dumps({"type": "token", "data": token}) + "\n"
        except Exception as e:
            yield json.dumps({"type": "error", "data": str(e)}) + "\n"

streaming_cache = StreamingCacheResponse()
