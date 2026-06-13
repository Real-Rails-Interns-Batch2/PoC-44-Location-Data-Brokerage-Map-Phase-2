# ─────────────────────────────────────────────────────────────
#  Real Rails PoC 44 — Frontend
#  Multi-stage build: deps → builder → runner
# ─────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifests only (better layer caching)
COPY frontend/package.json frontend/package-lock.json* ./

RUN npm ci --prefer-offline


# ── Stage 2: build Next.js production bundle ─────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Build-time env vars (public ones baked into the bundle)
ARG NEXT_PUBLIC_API_URL=http://backend:8000
ARG NEXT_PUBLIC_MAPBOX_TOKEN=""

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build -- --no-lint || npx next build --no-lint


# ── Stage 3: minimal production runner ───────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs to run
COPY --from=builder /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
