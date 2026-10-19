import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.quiz import router as quiz_router
from app.api.explain import router as explain_router
from app.api.agent import router as agent_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("guruai.main")

app = FastAPI(
    title="GuruAI — Study Assistant Microservice",
    description="Production-grade GenAI + RAG + Agentic AI Service for GuruConnect",
    version="1.0.0"
)

# CORS Middleware to allow requests from Node.js backend and frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(quiz_router)
app.include_router(explain_router)
app.include_router(agent_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "GuruAI Study Assistant Microservice",
        "version": "1.0.0",
        "llmProvider": settings.LLM_PROVIDER,
        "embeddingModel": settings.EMBEDDING_MODEL
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
