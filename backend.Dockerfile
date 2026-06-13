# ─────────────────────────────────────────────────────────────
#  Real Rails PoC 44 — Backend
#  Multi-stage build: builder → runtime
# ─────────────────────────────────────────────────────────────

# ── Stage 1: install & compile Python deps ───────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System deps for Pandas (C compiler, headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: lean runtime ─────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code and static data
COPY backend/ .

# Non-root user
RUN addgroup --system --gid 1001 appgroup \
 && adduser  --system --uid 1001 --ingroup appgroup appuser

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
