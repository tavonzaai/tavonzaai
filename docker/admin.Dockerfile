FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY frontend/admin/ ./frontend/admin/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @frontend/admin build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3102

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/frontend/admin/.next ./frontend/admin/.next
COPY --from=builder /app/frontend/admin/public ./frontend/admin/public
COPY --from=builder /app/frontend/admin/package.json ./frontend/admin/package.json
COPY --from=builder /app/frontend/admin/node_modules ./frontend/admin/node_modules

USER nextjs
EXPOSE 3102
CMD ["pnpm", "--filter", "@frontend/admin", "start"]
