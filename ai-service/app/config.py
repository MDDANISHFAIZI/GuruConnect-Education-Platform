import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for ai-service
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # LLM Provider Selection
    # Options: "mistral" | "openai" | "gemini" | "groq"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mistral").lower()
    LLM_MODEL: str = os.getenv("LLM_MODEL", "mistral-small-latest")

    # API Keys (set whichever provider you are using)
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Embeddings Settings
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers").lower()
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # Storage and Retrieval
    FAISS_INDEX_DIR: str = os.getenv("FAISS_INDEX_DIR", str(BASE_DIR / "storage" / "faiss_index"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "150"))
    TOP_K: int = int(os.getenv("TOP_K", "4"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.15"))

settings = Settings()

# Ensure FAISS index storage directory exists
os.makedirs(settings.FAISS_INDEX_DIR, exist_ok=True)
