"""
Tavonza AI Service — Entrypoint
================================
Start here. Everything else is up to you.

Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI

app = FastAPI(
    title="Tavonza AI Service",
    version="0.1.0",
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def hello():
    return {"message": "Tavonza AI service is running"}
