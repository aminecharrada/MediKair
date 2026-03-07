"""
MediKair AI Recommendation Service
====================================
FastAPI micro-service that provides:
  • Content-based filtering  (similar products)
  • Collaborative filtering  (personal recommendations)
  • Hybrid filtering          (weighted combination)
  • Cross-sell / Up-sell      (frequently bought together / premium alternatives)
"""

import os, logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from db import connect_db, close_db
from routers import recommendations

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("🔄 Connecting to MongoDB …")
    await connect_db()
    logger.info("✅ AI service ready")
    yield
    await close_db()
    logger.info("👋 AI service stopped")


app = FastAPI(
    title="MediKair AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/api/ai")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-recommendations"}
