ARG APP_NAME=customer
ARG APP_PORT=3000

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

FROM base AS builder
ARG APP_NAME
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/ ./packages/
COPY frontend/ ./frontend/

RUN pnpm install --frozen-lockfile
RUN npx turbo run build --filter=@frontend/${APP_NAME}...

FROM base AS runner
ARG APP_NAME
ARG APP_PORT
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${APP_PORT}
ENV APP_TARGET=${APP_NAME}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/frontend/${APP_NAME}/.next ./frontend/${APP_NAME}/.next
COPY --from=builder /app/frontend/${APP_NAME}/public ./frontend/${APP_NAME}/public
COPY --from=builder /app/frontend/${APP_NAME}/package.json ./frontend/${APP_NAME}/package.json
COPY --from=builder /app/frontend/${APP_NAME}/node_modules ./frontend/${APP_NAME}/node_modules

USER nextjs
EXPOSE ${APP_PORT}
CMD pnpm --filter "@frontend/${APP_TARGET}" start
