from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import create_tables
from routers import auth, documents, signatures, audit


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run on startup: create DB tables and upload directory."""
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    create_tables()
    print("✅ Database tables created")
    yield
    print("🛑 Shutting down...")


app = FastAPI(
    title="Document Signature API",
    description="Secure PDF signing platform — upload, sign, audit",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React frontend in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(signatures.router)
app.include_router(audit.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "Document Signature API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
