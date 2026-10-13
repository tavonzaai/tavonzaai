ARG BASE_IMAGE=python:3.11-slim
FROM ${BASE_IMAGE} AS base
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY apps/ai/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ai/ ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
