import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# --- CONFIGURATION & SETUP ---
NEXT_PUBLIC_SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not NEXT_PUBLIC_SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.")

# Initialize Supabase client
supabase: Client = create_client(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

OLLAMA_SERVER_URL = "http://localhost:11434/api/generate"
CUSTOM_MODEL_NAME = "synergyai-specialist"
