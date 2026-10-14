ARG APP_NAME=customer
ARG APP_PORT=3000
ARG BASE_IMAGE=node:20-alpine

FROM ${BASE_IMAGE} AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 10000 && \
    pnpm config set fetch-retry-maxtimeout 60000 && \
    pnpm config set network-concurrency 16
WORKDIR /app

FROM base AS builder
ARG APP_NAME
ARG NEXT_PUBLIC_API_URL=https://api.tavonza.com
ARG NEXT_PUBLIC_AI_API_URL=https://ai.tavonza.com
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY frontend/ ./frontend/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@frontend/${APP_NAME}...

FROM base AS runner
ARG APP_NAME
ARG APP_PORT
ARG NEXT_PUBLIC_API_URL=https://api.tavonza.com
ARG NEXT_PUBLIC_AI_API_URL=https://ai.tavonza.com
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=${APP_PORT}
ENV APP_TARGET=${APP_NAME}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
ENV API_BASE_URL=${NEXT_PUBLIC_API_URL}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/frontend/${APP_NAME}/public ./frontend/${APP_NAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/${APP_NAME}/.next/static ./frontend/${APP_NAME}/.next/static

USER nextjs
EXPOSE ${APP_PORT}
CMD ["sh", "-c", "node frontend/${APP_TARGET}/server.js"]

