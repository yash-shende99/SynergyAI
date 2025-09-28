import faiss
import pickle
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import Optional, List, Dict
import os

# --- CONFIGURATION ---
FAISS_INDEX_PATH = "synergyai_index.faiss"
TEXT_MAP_PATH = "synergyai_text_map.pkl"
EMBEDDING_MODEL_NAME = 'BAAI/bge-small-en-v1.5'

class RAGSystem:
    """
    This class encapsulates the entire RAG pipeline: loading the index,
    the embedding model, and performing semantic search. It's our "Librarian."
    """
    def __init__(self):
        print("--- Initializing RAG System: Loading models and index... ---")
        try:
            self.model = SentenceTransformer(EMBEDDING_MODEL_NAME, device='cuda')
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            with open(TEXT_MAP_PATH, 'rb') as f:
                self.chunk_map = pickle.load(f)
            print("✅ RAG System initialized successfully.")
        except Exception as e:
            print(f"❌ FATAL ERROR: Could not initialize RAG System: {e}")
            print("   Please ensure 'synergyai_index.faiss' and 'synergyai_text_map.pkl' exist.")
            self.model = None
            self.index = None

    def search(self, query_text: str, k: int = 5, allowed_sources: Optional[List[str]] = None) -> List[Dict]:
        """
        Performs a semantic search, now with an optional filter to scope
        the search to a specific list of source documents.
        """
        if not self.index or not self.model:
            return []
            
        try:
            query_embedding = self.model.encode([query_text])
            query_embedding = np.array(query_embedding).astype('float32')

            search_k = k * 5 if allowed_sources else k
            distances, indices = self.index.search(query_embedding, search_k)

            filtered_results = []
            for i in indices[0]:
                chunk = self.chunk_map[i]
                if allowed_sources is None or chunk['source'] in allowed_sources:
                    filtered_results.append(chunk)
                if len(filtered_results) >= k:
                    break
            
            return filtered_results
        except Exception as e:
            print(f"Error during RAG search: {e}")
            return []

# Create a single, global instance of our RAG system
rag_system = RAGSystem()

