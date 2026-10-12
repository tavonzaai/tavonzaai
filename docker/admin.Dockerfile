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
COPY frontend/admin/ ./frontend/admin/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@frontend/admin...

FROM ${BASE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3043

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/frontend/admin/.next ./frontend/admin/.next
COPY --from=builder /app/frontend/admin/public ./frontend/admin/public
COPY --from=builder /app/frontend/admin/next.config.js ./frontend/admin/next.config.js
COPY --from=builder /app/frontend/admin/package.json ./frontend/admin/package.json
COPY --from=builder /app/frontend/admin/node_modules ./frontend/admin/node_modules

USER nextjs
EXPOSE 3043
CMD ["pnpm", "--filter", "@frontend/admin", "start"]
