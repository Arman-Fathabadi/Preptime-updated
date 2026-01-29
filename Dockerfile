FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if any (none for now, but good practice to have apt-get update)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY ml_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY ml_service ./ml_service
COPY shared ./shared

# Environment variables
ENV PYTHONUNBUFFERED=1

# Run uvicorn using the PORT environment variable provided by Cloud Run
CMD sh -c "uvicorn ml_service.main:app --host 0.0.0.0 --port \${PORT:-7860}"
