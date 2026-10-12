ARG BASE_IMAGE=public.ecr.aws/docker/library/node:20-alpine
FROM ${BASE_IMAGE} AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 10000 && \
    pnpm config set fetch-retry-maxtimeout 60000 && \
    pnpm config set network-concurrency 16
WORKDIR /app

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY frontend/customer/ ./frontend/customer/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@frontend/customer...

FROM ${BASE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/frontend/customer/.next ./frontend/customer/.next
COPY --from=builder /app/frontend/customer/public ./frontend/customer/public
COPY --from=builder /app/frontend/customer/next.config.js ./frontend/customer/next.config.js
COPY --from=builder /app/frontend/customer/package.json ./frontend/customer/package.json
COPY --from=builder /app/frontend/customer/node_modules ./frontend/customer/node_modules

USER nextjs
EXPOSE 3000
CMD ["pnpm", "--filter", "@frontend/customer", "start"]
