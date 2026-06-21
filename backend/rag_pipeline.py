# ===== SSL FIX FOR RAG SYSTEM =====
import os
import ssl
import urllib3

# Disable SSL verification for development
os.environ['HF_HUB_DISABLE_SSL_VERIFICATION'] = '1'
os.environ['PYTHONHTTPSVERIFY'] = '0'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''

# Disable SSL verification
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# For requests library
try:
    import requests
    requests.packages.urllib3.disable_warnings()
except:
    pass
# ===================================
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
            import torch
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
            print(f"--- Loading SentenceTransformer on {device}... ---")
            self.model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=device)
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            with open(TEXT_MAP_PATH, 'rb') as f:
                self.chunk_map = pickle.load(f)
            print("[OK] RAG System initialized successfully.")
        except Exception as e:
            try:
                print(f"[ERROR] Could not initialize RAG System: {e}")
            except Exception:
                print("[ERROR] Could not initialize RAG System.")
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

