ARG BASE_IMAGE=node:20-slim

# --- 1. Base Runtime Layer ---
FROM ${BASE_IMAGE} AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# --- 2. Dependencies Layer ---
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# --- 3. Build Layer ---
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json tsconfig.json nest-cli.json drizzle.config.ts ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/
RUN pnpm build

# --- 4. Production Runner: Web API & Socket.IO Gateway Target ---
FROM base AS api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/drizzle ./drizzle

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/src/main.js"]

# --- 5. Production Runner: Background Worker Target ---
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production

COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/drizzle ./drizzle

USER node

CMD ["node", "dist/src/worker.js"]
