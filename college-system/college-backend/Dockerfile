# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (separate layer for cache)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Non-root user — never run as root in production
RUN addgroup -S app && adduser -S app -G app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output and Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Persistent upload volume — mount a host path here to survive container restarts
# docker run -v /opt/college/uploads:/app/uploads ...
VOLUME ["/app/uploads"]

# Switch to non-root before exposing ports
USER app

EXPOSE 5000

# Liveness probe — Docker and orchestrators use this to detect crashed containers
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health/live || exit 1

# NOTE: Run migrations separately before starting:
#   docker run --rm <image> node -e "require('./dist/src/config/database'); \
#     const {execSync}=require('child_process'); execSync('npx prisma migrate deploy',{stdio:'inherit'})"
# Or in your deploy script: npx prisma migrate deploy
CMD ["node", "dist/src/server.js"]
