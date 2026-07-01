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
import threading
import fitz

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
        self.lock = threading.Lock()
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

            # When filtering by allowed sources (e.g. per-user projects), we need to 
            # retrieve a very large number of candidate chunks before post-filtering,
            # otherwise the user's chunks will be crowded out by global chunks.
            search_k = 2000 if allowed_sources else k
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

    def ingest_document(self, file_path: str, source_name: str):
        """
        Extracts text from a document, chunks it, and adds it to the FAISS index and chunk map.
        Supports .pdf and .txt files.
        """
        if not self.index or not self.model:
            print("[ERROR] RAG System not fully initialized. Cannot ingest.")
            return

        print(f"--- Ingesting document: {source_name} ---")
        try:
            text = ""
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.pdf':
                doc = fitz.open(file_path)
                for page in doc:
                    text += page.get_text() + "\n"
                doc.close()
            elif ext == '.docx':
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()

            if not text.strip():
                print(f"[WARN] No text extracted from {source_name}")
                return

            # Simple chunking by words
            words = text.split()
            chunk_size = 400
            overlap = 50
            chunks = []
            
            i = 0
            while i < len(words):
                chunk_words = words[i:i + chunk_size]
                chunk_text = " ".join(chunk_words)
                if chunk_text.strip():
                    chunks.append(chunk_text)
                i += chunk_size - overlap

            if not chunks:
                return

            print(f"Extracted {len(chunks)} chunks from {source_name}. Generating embeddings...")
            
            with self.lock:
                embeddings = self.model.encode(chunks)
                embeddings = np.array(embeddings).astype('float32')
                
                # Add to index
                self.index.add(embeddings)
                
                # Add to chunk map
                for chunk_text in chunks:
                    self.chunk_map.append({
                        'source': source_name,
                        'content': chunk_text
                    })
                
                print("Updating FAISS index on disk...")
                faiss.write_index(self.index, FAISS_INDEX_PATH)
                with open(TEXT_MAP_PATH, 'wb') as f:
                    pickle.dump(self.chunk_map, f)
            
            print(f"[OK] Successfully ingested {source_name}")
            
        except Exception as e:
            print(f"[ERROR] Failed to ingest document {source_name}: {e}")

# Create a single, global instance of our RAG system
rag_system = RAGSystem()

