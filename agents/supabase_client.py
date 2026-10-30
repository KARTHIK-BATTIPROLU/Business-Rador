"""
Supabase client singleton for all Python agents.
Supports .env and .env.local autoloading with graceful fallback.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

log = logging.getLogger("SupabaseClient")

# Automatically search for .env.local and .env
env_paths = [
    Path(__file__).parent / ".env",
    Path(__file__).parent / ".env.local",
    Path(__file__).parent.parent / ".env.local",
    Path(__file__).parent.parent / ".env",
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)

_client = None


def get_supabase():
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key or "your_supabase_project_url" in url or "your_anon_key" in key:
        return None

    try:
        from supabase import create_client
        _client = create_client(url, key)
        return _client
    except Exception as e:
        log.warning(f"Could not connect to Supabase: {e}")
        return None
