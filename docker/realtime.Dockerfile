FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/realtime/ ./apps/realtime/

RUN pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@tavonza/realtime...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV REALTIME_PORT=3001

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 realtime

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/realtime/dist ./apps/realtime/dist
COPY --from=builder /app/apps/realtime/package.json ./apps/realtime/package.json
COPY --from=builder /app/apps/realtime/node_modules ./apps/realtime/node_modules

USER realtime
EXPOSE 3001
CMD ["node", "apps/realtime/dist/main.js"]