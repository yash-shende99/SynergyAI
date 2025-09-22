import faiss
import pickle
from sentence_transformers import SentenceTransformer
import numpy as np
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
            # Load the embedding model, ensuring it runs on the GPU for speed
            self.model = SentenceTransformer(EMBEDDING_MODEL_NAME, device='cuda')
            # Load the pre-built FAISS index (our "card catalog")
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            # Load the map that links index positions back to the original text
            with open(TEXT_MAP_PATH, 'rb') as f:
                self.chunk_map = pickle.load(f)
            print("✅ RAG System initialized successfully.")
        except Exception as e:
            print(f"❌ FATAL ERROR: Could not initialize RAG System: {e}")
            print("   Please ensure 'synergyai_index.faiss' and 'synergyai_text_map.pkl' exist.")
            self.model = None
            self.index = None

    def search(self, query_text: str, k: int = 5) -> list[dict]:
        """
        Performs a semantic search to find the most relevant text chunks.
        """
        if not self.index or not self.model:
            return []
            
        try:
            # 1. Convert the user's question into a numerical vector
            query_embedding = self.model.encode([query_text])
            query_embedding = np.array(query_embedding).astype('float32')

            # 2. Use FAISS to search the index for the 'k' most similar vectors
            distances, indices = self.index.search(query_embedding, k)

            # 3. Retrieve the original text chunks and their sources
            results = [self.chunk_map[i] for i in indices[0]]
            return results
        except Exception as e:
            print(f"Error during RAG search: {e}")
            return []

# Create a single, global instance of our RAG system
# This ensures the models are only loaded once when the server starts.
rag_system = RAGSystem()

