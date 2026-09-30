"""
Tavonza AI Service — Entrypoint
================================
Run from apps/ai directory:
    uvicorn main:app --reload --port 8000

Run from repository root:
    python -m uvicorn apps.ai.main:app --port 8000 --reload

Interactive API documentation:
    http://localhost:8000/docs
"""

import sys
from pathlib import Path

# Ensure src is directly importable
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.main import app  # noqa: E402 # type: ignore

__all__ = ["app"]

