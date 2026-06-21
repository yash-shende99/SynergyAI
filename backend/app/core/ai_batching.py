import asyncio
from concurrent.futures import ThreadPoolExecutor
import httpx
from typing import List, Dict
from app.core.config import OLLAMA_SERVER_URL, CUSTOM_MODEL_NAME

class AIBatchProcessor:
    """
    Process multiple AI requests in batches with intelligent grouping
    """
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.batch_size = 5
        self.timeout = 120.0
    
    async def batch_ai_calls(self, prompts: List[str], model: str = CUSTOM_MODEL_NAME) -> List[Dict]:
        """
        Process multiple AI calls in parallel with rate limiting
        """
        if not prompts:
            return []
        
        # Group similar prompts for potential batching
        batches = [prompts[i:i+self.batch_size] for i in range(0, len(prompts), self.batch_size)]
        results = []
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for batch in batches:
                # Process batch in parallel
                batch_results = await asyncio.gather(*[
                    self._call_ai(client, prompt, model) 
                    for prompt in batch
                ])
                results.extend(batch_results)
        
        return results
    
    async def _call_ai(self, client, prompt: str, model: str) -> Dict:
        """Single AI call with retry logic"""
        for attempt in range(3):
            try:
                response = await client.post(
                    OLLAMA_SERVER_URL,
                    json={"model": model, "prompt": prompt, "stream": False},
                    timeout=60.0
                )
                if response.status_code == 200:
                    return response.json()
            except Exception as e:
                print(f"AI call attempt {attempt+1} failed: {e}")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        return {"response": "AI call failed after retries"}

ai_batch = AIBatchProcessor()
