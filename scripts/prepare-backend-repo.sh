#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: prepare-backend-repo.sh
# Purpose: Transform tavonzaai repository into a dedicated, clean backend repository
# Target Branch: feature/backend-standalone (safe branch, preserves main)
# ==============================================================================

BRANCH_NAME="${1:-feature/backend-standalone}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================================="
echo "  🚀 Tavonza Backend Repository Preparation"
echo "  Branch to create: $BRANCH_NAME"
echo "  Target: Lean, dedicated backend repository"
echo "=================================================================="

cd "$REPO_ROOT"

# Ensure we're on git
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository."
  exit 1
fi

echo "🌿 Step 1: Creating and switching to branch '$BRANCH_NAME'..."
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"

echo "🗑️  Step 2: Removing frontend/ and apps/ai/ from backend..."
if [ -d "frontend" ]; then
  git rm -rf frontend
fi
if [ -d "apps/ai" ]; then
  git rm -rf apps/ai
fi

# Clean scratch files if present
rm -f scratch/analyze_imports.js scratch/analyze_api_modules.js 2>/dev/null || true

echo "⚙️  Step 3: Updating pnpm-workspace.yaml..."
cat << 'EOF' > pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
EOF
git add pnpm-workspace.yaml

echo "⚙️  Step 4: Streamlining root package.json for backend operations..."
cat << 'EOF' > package.json
{
  "name": "tavonza-backend-monorepo",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.1.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "dev:api": "pnpm --filter @tavonza/api dev",
    "dev:worker": "pnpm --filter @tavonza/worker dev",
    "dev:realtime": "pnpm --filter @tavonza/realtime dev",
    "lint": "turbo run typecheck",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f",
    "storage:test:minio": "pnpm --filter @tavonza/storage test:minio",
    "storage:test:s3": "pnpm --filter @tavonza/storage test:s3",
    "db:push": "pnpm --filter @tavonza/database db:push",
    "db:generate": "pnpm --filter @tavonza/database db:generate",
    "db:migrate": "pnpm --filter @tavonza/database db:migrate",
    "db:studio": "pnpm --filter @tavonza/database db:studio",
    "db:seed": "pnpm --filter @tavonza/database db:seed",
    "db:reset": "pnpm --filter @tavonza/database db:reset"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.5"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
EOF
git add package.json

echo "⚙️  Step 5: Updating Docker development configuration..."
cat << 'EOF' > docker/docker-compose.dev.yaml
services:
  # ─── Backend Platform Applications ─────────────────────────────────────
  api:
    image: ${IMAGE_PREFIX:-ghcr.io/tavonzaai}/tavonzaai-dev-api:latest
    container_name: tavonzaai-dev-api
    restart: unless-stopped
    ports:
      - "5000:3000"
    env_file:
      - .env
    environment:
      PORT: 3000
      API_PORT: 3000

  worker:
    image: ${IMAGE_PREFIX:-ghcr.io/tavonzaai}/tavonzaai-dev-worker:latest
    container_name: tavonzaai-dev-worker
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      api:
        condition: service_started

  realtime:
    image: ${IMAGE_PREFIX:-ghcr.io/tavonzaai}/tavonzaai-dev-realtime:latest
    container_name: tavonzaai-dev-realtime
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env
    environment:
      REALTIME_PORT: 3001

  # ─── Reverse Proxy & SSL ───────────────────────────────────────────────
  caddy:
    image: caddy:2-alpine
    container_name: tavonzaai-dev-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_dev_data:/data
      - caddy_dev_config:/config
    env_file:
      - .env
    depends_on:
      - api

volumes:
  caddy_dev_data:
    name: tavonzaai_caddy_dev_data
  caddy_dev_config:
    name: tavonzaai_caddy_dev_config

networks:
  default:
    name: tavonzaai_dev_network
EOF
git add docker/docker-compose.dev.yaml

cat << 'EOF' > docker/Caddyfile
{
    email {$ACME_EMAIL:admin@tavonza.com}
}

# apps/api -> api.tavonza.com
api.{$BASE_DOMAIN:tavonza.com} {
    reverse_proxy api:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

# apps/realtime -> realtime.tavonza.com
realtime.{$BASE_DOMAIN:tavonza.com} {
    reverse_proxy realtime:3001 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
EOF
git add docker/Caddyfile

echo "📦 Step 6: Refreshing pnpm lockfile for backend only..."
pnpm install

echo "🧪 Step 7: Verifying backend typecheck..."
pnpm --filter @tavonza/api typecheck
pnpm --filter @tavonza/worker typecheck

git add pnpm-lock.yaml
git commit -m "chore(repo): streamline repository to dedicated backend workspace" || true

echo ""
echo "=================================================================="
echo "  ✅ Tavonza Backend workspace successfully prepared!"
echo "  Current branch: $BRANCH_NAME"
echo "=================================================================="
echo "Backend developers can now run:"
echo "  • pnpm dev:api       -> Starts NestJS API on http://localhost:3000"
echo "  • pnpm dev:worker    -> Starts BullMQ background workers"
echo "  • pnpm db:studio     -> Opens Drizzle Studio"
echo "  • pnpm typecheck     -> Validates all backend packages & apps"
echo "=================================================================="
